// Integrated demo logic from demo.js
var animationWriters = [];
var currentStrokeIndex = 0;
var updateTimeout = null;
var isPlaying = false;
var animationPromise = null;
var strokeSpeedFactor = 1; // 1 = normal speed
var translationTimeout = null;
var cedictWorker = null;
var cedictPending = {};
var cedictSeq = 0;
var translationInfoEl = null;

// Initialize OpenCC converters
var converterToTraditional = null;
var converterToSimplified = null;

// Initialize OpenCC when available
if (typeof OpenCC !== 'undefined') {
  converterToTraditional = OpenCC.Converter({ from: 'cn', to: 'tw' });
  converterToSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' });
}

function getScriptType() {
  return $('input[name="script-type"]:checked').val();
}

function convertText(text, targetScript) {
  if (!converterToTraditional || !converterToSimplified) {
    return text;
  }
  
  if (targetScript === 'traditional') {
    return converterToTraditional(text);
  } else if (targetScript === 'simplified') {
    return converterToSimplified(text);
  }
  return text;
}

function ensureCedictWorker() {
  if (cedictWorker) {
    return cedictWorker;
  }
  cedictWorker = new Worker('/assets/js/cedict-worker.js');

  cedictWorker.onmessage = function(evt) {
    var msg = evt.data || {};
    if (!msg.id || !cedictPending[msg.id]) return;
    var pending = cedictPending[msg.id];
    clearTimeout(pending.timer);
    delete cedictPending[msg.id];
    if (msg.error) {
      pending.reject(new Error(msg.error));
    } else {
      pending.resolve(msg.result || {});
    }
  };

  cedictWorker.onerror = function(err) {
    console.error('CC-CEDICT worker error:', err);
    // Reject all pending requests and clean up
    for (var id in cedictPending) {
      if (cedictPending.hasOwnProperty(id)) {
        var pending = cedictPending[id];
        clearTimeout(pending.timer);
        pending.reject(new Error('CC-CEDICT worker error: ' + (err.message || err)));
        delete cedictPending[id];
      }
    }
  };

  return cedictWorker;
}

function ensureTranslationInfo() {
  if (translationInfoEl) return translationInfoEl;
  var container = document.getElementById('translation-display');
  if (!container) return null;
  translationInfoEl = document.createElement('span');
  translationInfoEl.id = 'translation-info';
  translationInfoEl.style.marginLeft = '6px';
  translationInfoEl.style.cursor = 'pointer';
  translationInfoEl.style.color = '#888';
  translationInfoEl.setAttribute('tabindex', '0');
  translationInfoEl.setAttribute('role', 'button');
  translationInfoEl.setAttribute('aria-label', 'Show detailed definitions');
  translationInfoEl.innerHTML = '<i class="fas fa-info-circle"></i>';
  container.appendChild(translationInfoEl);
  
  // Create toast element
  var toastEl = document.createElement('div');
  toastEl.id = 'definition-toast';
  toastEl.style.position = 'fixed';
  toastEl.style.top = '50%';
  toastEl.style.left = '50%';
  toastEl.style.transform = 'translate(-50%, -50%)';
  toastEl.style.display = 'none';
  toastEl.style.backgroundColor = '#fff';
  toastEl.style.color = '#333';
  toastEl.style.padding = '16px 20px';
  toastEl.style.borderRadius = '8px';
  toastEl.style.fontSize = '14px';
  toastEl.style.zIndex = '1000';
  toastEl.style.maxWidth = '450px';
  toastEl.style.minWidth = '300px';
  toastEl.style.whiteSpace = 'pre-wrap';
  toastEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toastEl.style.border = '1px solid #ddd';
  toastEl.style.fontFamily = 'inherit';
  toastEl.style.lineHeight = '1.5';
  
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '8px';
  closeBtn.style.right = '12px';
  closeBtn.style.border = 'none';
  closeBtn.style.background = 'transparent';
  closeBtn.style.fontSize = '24px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#999';
  closeBtn.style.padding = '0';
  closeBtn.style.lineHeight = '1';
  closeBtn.setAttribute('aria-label', 'Close');
  
  var contentEl = document.createElement('div');
  contentEl.style.paddingRight = '20px';
  
  toastEl.appendChild(closeBtn);
  toastEl.appendChild(contentEl);
  document.body.appendChild(toastEl);
  
  var isToastVisible = false;
  
  function showToast() {
    var detail = translationInfoEl.getAttribute('data-detail') || translationInfoEl.getAttribute('title') || '';
    if (!detail) return;
    
    contentEl.textContent = detail;
    toastEl.style.display = 'block';
    isToastVisible = true;
  }
  
  function hideToast() {
    toastEl.style.display = 'none';
    isToastVisible = false;
  }
  
  // Click info icon to toggle
  translationInfoEl.onclick = function(e) {
    e.stopPropagation();
    if (isToastVisible) {
      hideToast();
    } else {
      showToast();
    }
  };
  
  // Close button
  closeBtn.onclick = function(e) {
    e.stopPropagation();
    hideToast();
  };
  
  // Keyboard support
  translationInfoEl.onkeydown = function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isToastVisible) {
        hideToast();
      } else {
        showToast();
      }
    }
  };
  
  closeBtn.onkeydown = function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hideToast();
    }
  };
  
  // Escape to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isToastVisible) {
      hideToast();
    }
  });
  
  return translationInfoEl;
}

function lookupCedict(text) {
  if (!text || text.trim() === '') {
    return Promise.resolve({});
  }

  ensureCedictWorker();
  return new Promise(function(resolve, reject) {
    var id = 'cedict-' + (++cedictSeq);
    
    // Create timeout that auto-rejects after 30 seconds
    var timer = setTimeout(function() {
      if (cedictPending[id]) {
        delete cedictPending[id];
        reject(new Error('CC-CEDICT lookup timeout'));
      }
    }, 30000);
    
    cedictPending[id] = { resolve: resolve, reject: reject, timer: timer };
    try {
      cedictWorker.postMessage({ id: id, type: 'lookup', text: text });
    } catch (err) {
      clearTimeout(timer);
      delete cedictPending[id];
      reject(err);
    }
  });
}

// Function to get translation from CC-CEDICT via Web Worker
async function getTranslation(characters) {
  if (!characters || characters.trim() === '') {
    $('#translation-display').hide();
    return;
  }

  try {
    $('#translation-text').text('....');
    $('#translation-display').show();

    var results = await lookupCedict(characters);
    var mainText = '';
    var detailParts = [];

    var hasFull = false;
    if (results._full && results._full.d) {
      // Show only the main gloss for the phrase
      hasFull = true;
      mainText = results._full.d;
      var fullDetail = characters + ': ' + results._full.d;
      if (results._full.p) fullDetail += ' (' + results._full.p + ')';
      detailParts.push(fullDetail);
    }

    var seen = {};
    for (var i = 0; i < characters.length; i++) {
      var ch = characters[i];
      if (!ch || /\s/.test(ch)) continue;
      if (seen[ch]) continue;
      seen[ch] = true;
      var entry = results[ch];
      if (entry && entry.d) {
        // Skip adding per-character detail if we already have _full for a single character
        if (!(hasFull && characters.length === 1)) {
          // Use allDefs for tooltip (includes all variants, surnames, etc.)
          var defsText = entry.allDefs && entry.allDefs.length ? entry.allDefs.join(' / ') : entry.d;
          var snippet = ch + ': ' + defsText;
          if (entry.p) snippet += ' (' + entry.p + ')';
          detailParts.push(snippet);
        }
        
        if (!mainText) {
          mainText = entry.d;
        }
      }
    }

    if (!mainText) {
      $('#translation-text').text('No CC-CEDICT entry found.');
      return;
    }

    $('#translation-text').text(mainText);

    var detailText = detailParts.join('\n');
    var infoEl = ensureTranslationInfo();
    if (infoEl) {
      if (detailText) {
        infoEl.style.display = 'inline';
        infoEl.setAttribute('title', detailText);
        infoEl.setAttribute('data-detail', detailText);
      } else {
        infoEl.style.display = 'none';
        infoEl.removeAttribute('title');
        infoEl.removeAttribute('data-detail');
      }
    }
    // Fallback tooltip on main text
    $('#translation-text').attr('title', detailText || '');
    $('#translation-display').show();
  } catch (error) {
    console.error('Translation error:', error);
    $('#translation-display').hide();
  }
}

function updateCharacter() {
  var inputText = $('#character-select').val().trim();
  if (!inputText) {
    $('#animation-target').html('<p style="padding: 20px; color: #999;">Enter characters above to see them here</p>');
    $('#translation-display').hide();
    animationWriters = [];
    return;
  }

  var scriptType = getScriptType();
  var characters = convertText(inputText, scriptType);

  $('#animation-target').html('');

  // Clear old writers
  animationWriters = [];
  currentStrokeIndex = 0;

  // Debounce translation API call
  if (translationTimeout) {
    clearTimeout(translationTimeout);
  }
  translationTimeout = setTimeout(function() {
    getTranslation(characters);
  }, 500); // Wait 500ms after user stops typing

  // Split into individual characters
  var charArray = characters.split('');
  var charCount = charArray.length;
  var size = charCount === 1 ? 300 : (charCount <= 3 ? 200 : 150);

  charArray.forEach(function(char, index) {
    // Create container for character + pinyin
    var charContainer = document.createElement('div');
    charContainer.style.display = 'inline-block';
    charContainer.style.margin = '5px';
    charContainer.style.textAlign = 'center';
    charContainer.style.verticalAlign = 'top';
    
    // Create pinyin display
    var pinyinDiv = document.createElement('div');
    pinyinDiv.id = 'pinyin-' + index;
    pinyinDiv.style.fontSize = '16px';
    pinyinDiv.style.color = '#666';
    pinyinDiv.style.marginBottom = '5px';
    pinyinDiv.style.minHeight = '20px';
    charContainer.appendChild(pinyinDiv);
    
    // Create animation writer
    var animDiv = document.createElement('div');
    animDiv.id = 'anim-char-' + index;
    charContainer.appendChild(animDiv);
    
    document.getElementById('animation-target').appendChild(charContainer);

    var animWriter = HanziWriter.create(animDiv.id, char, {
      width: size,
      height: size,
      padding: 5,
      showOutline: shouldShowOutline('animation'),
      showCharacter: false, 
      drawingWidth: 25, 
      strokeWidth: 25,
      charDataLoader: function(loadChar) {
        return HanziWriter.loadCharacterData(loadChar).then(function(charData) {
          var svg = document.querySelector('#' + animDiv.id + ' svg');
          if (svg && !svg.getAttribute('data-has-grid')) {
            var ns = 'http://www.w3.org/2000/svg';
            var width = size;
            var height = size;

            var grid = document.createElementNS(ns, 'g');
            grid.setAttribute('stroke', '#f48c8c');
            grid.setAttribute('stroke-width', '1');
            grid.setAttribute('stroke-dasharray', '4,4');

            var centerV = document.createElementNS(ns, 'line');
            centerV.setAttribute('x1', width / 2);
            centerV.setAttribute('y1', 0);
            centerV.setAttribute('x2', width / 2);
            centerV.setAttribute('y2', height);

            var centerH = document.createElementNS(ns, 'line');
            centerH.setAttribute('x1', 0);
            centerH.setAttribute('y1', height / 2);
            centerH.setAttribute('x2', width);
            centerH.setAttribute('y2', height / 2);

            var diag1 = document.createElementNS(ns, 'line');
            diag1.setAttribute('x1', 0);
            diag1.setAttribute('y1', height);
            diag1.setAttribute('x2', width);
            diag1.setAttribute('y2', 0);

            var diag2 = document.createElementNS(ns, 'line');
            diag2.setAttribute('x1', 0);
            diag2.setAttribute('y1', 0);
            diag2.setAttribute('x2', width);
            diag2.setAttribute('y2', height);

            grid.appendChild(diag1);
            grid.appendChild(diag2);
            grid.appendChild(centerV);
            grid.appendChild(centerH);

            svg.insertBefore(grid, svg.firstChild);
            svg.setAttribute('data-has-grid', 'true');
          }

          return charData;
        });
      }
    });
    
    // Try to access character data after writer is created
    setTimeout(function() {
      var showMandarin = $('#show-mandarin').prop('checked');
      var showCantonese = $('#show-cantonese').prop('checked');
      
      try {
        var pronunciations = [];
        
        // Get Mandarin pinyin
        if (showMandarin && typeof pinyinPro !== 'undefined') {
          var pinyinText = pinyinPro.pinyin(char, { toneType: 'symbol' });
          if (pinyinText) {
            pronunciations.push(pinyinText + ' (P)');
          }
        }
        
        // Get Cantonese jyutping
        if (showCantonese && typeof ToJyutping !== 'undefined') {
          var jyutpingText = ToJyutping.getJyutpingText(char);
          if (jyutpingText) {
            pronunciations.push(jyutpingText + ' (J)');
          }
        }
        
        if (pronunciations.length > 0) {
          pinyinDiv.textContent = pronunciations.join(' / ');
          pinyinDiv.style.display = 'block';
        } else {
          pinyinDiv.style.display = 'none';
        }
      } catch(e) {
        console.error('Error getting pronunciation:', e);
      }
    }, 100);
    
    animationWriters.push(animWriter);
  });

  // expose writers for debugging
  window.animationWriters = animationWriters;
}

function getTotalStrokes() {
  return animationWriters.reduce(function(total, writer) {
    return total + (writer._character ? writer._character.strokes.length : 0);
  }, 0);
}

function updateStrokeSliderMax() {
  var total = getTotalStrokes();
  var slider = document.getElementById('stroke-slider');
  var label = document.getElementById('stroke-slider-label');
  if (!slider || !label) return;
  slider.max = String(total);
  slider.value = String(currentStrokeIndex);
  label.textContent = currentStrokeIndex + ' / ' + total;
}

function renderCurrentState(animate) {
  if (animationWriters.length === 0) return;
  updateStrokeSliderMax();
  
  if (currentStrokeIndex === 0) {
    // No strokes to show, hide everything
    animationWriters.forEach(function(writer) {
      writer.hideCharacter();
    });
    var method = shouldShowOutline('animation') ? 'showOutline' : 'hideOutline';
    animationWriters.forEach(function(writer) {
      writer[method]();
    });
    return;
  }
  
  if (animate) {
    // For next button: just animate the newest stroke on top of existing state
    var strokeCount = 0;
    for (var i = 0; i < animationWriters.length; i++) {
      var writer = animationWriters[i];
      var charStrokes = writer._character ? writer._character.strokes.length : 0;
      
      for (var s = 0; s < charStrokes; s++) {
        if (strokeCount === currentStrokeIndex - 1) {
          writer.animateStroke(s, {
							duration: 1500 / strokeSpeedFactor,
            onComplete: function() {
              var method = shouldShowOutline('animation') ? 'showOutline' : 'hideOutline';
              animationWriters.forEach(function(writer) {
                writer[method]();
              });
            }
          });
          return;
        }
        strokeCount++;
      }
    }
  } else {
    // For prev button: reset everything and redraw all strokes up to currentStrokeIndex
    animationWriters.forEach(function(writer) {
      writer.hideCharacter();
    });
    
    var strokeCount = 0;
    var strokesToDraw = [];
    
    for (var i = 0; i < animationWriters.length; i++) {
      var writer = animationWriters[i];
      var charStrokes = writer._character ? writer._character.strokes.length : 0;
      
      for (var s = 0; s < charStrokes; s++) {
        if (strokeCount < currentStrokeIndex) {
          strokesToDraw.push({writer: writer, strokeIndex: s});
        }
        strokeCount++;
      }
    }
    
    // Draw all strokes in sequence with callbacks
    var drawIndex = 0;
    var drawNext = function() {
      if (drawIndex >= strokesToDraw.length) {
        var method = shouldShowOutline('animation') ? 'showOutline' : 'hideOutline';
        animationWriters.forEach(function(writer) {
          writer[method]();
        });
        return;
      }
      
      var item = strokesToDraw[drawIndex];
      drawIndex++;
      item.writer.animateStroke(item.strokeIndex, {
        immediate: true,
        onComplete: drawNext
      });
    };
    
    if (strokesToDraw.length > 0) {
      drawNext();
    } else {
      var method = shouldShowOutline('animation') ? 'showOutline' : 'hideOutline';
      animationWriters.forEach(function(writer) {
        writer[method]();
      });
    }
  }
}

  // Stroke timeline slider
  var strokeSlider = document.getElementById('stroke-slider');
  if (strokeSlider) {
    strokeSlider.addEventListener('input', function() {
      var total = getTotalStrokes();
      currentStrokeIndex = parseInt(this.value, 10) || 0;
      if (currentStrokeIndex < 0) currentStrokeIndex = 0;
      if (currentStrokeIndex >= total) currentStrokeIndex = total - 1; // Adjusted to prevent out of bounds
      // Re-render without animation for scrubbing
      renderCurrentState(false);
    });
  }

function shouldShowOutline(demoType) {
	return $('#' + demoType + '-show-outline').prop('checked');
}

$(function() {
	if ($('#practice').length) {
		// Extract characters from multiple sources
		var urlChars = '';
		
		console.log('Path chars:', window.HANZI_PATH_CHARS);
		console.log('SessionStorage:', sessionStorage.getItem('hanziguide_chars'));
		
		// First check if chars were extracted from path by inline script
		if (window.HANZI_PATH_CHARS) {
			urlChars = window.HANZI_PATH_CHARS;
			console.log('Using path chars:', urlChars);
		}
		// Then check sessionStorage (from 404 redirect OR previous session)
		else if (sessionStorage.getItem('hanziguide_chars')) {
			urlChars = sessionStorage.getItem('hanziguide_chars');
			// Don't remove it - keep it for persistence
			console.log('Using sessionStorage chars:', urlChars);
		}
		
		if (urlChars) {
			try {
				if (urlChars.length <= 6) {
					$('#character-select').val(urlChars);
					console.log('Set input to:', urlChars);
				}
			} catch (e) {
				console.log('Failed to process URL characters:', e);
			}
		}
		
		updateCharacter();

		// Auto-update on typing with debounce
		$('#character-select').on('input', function() {
			clearTimeout(updateTimeout);
			updateTimeout = setTimeout(function() {
				var chars = $('#character-select').val();
				// Save to sessionStorage for persistence
				if (chars) {
					sessionStorage.setItem('hanziguide_chars', chars);
				} else {
					sessionStorage.removeItem('hanziguide_chars');
				}
				updateCharacter();
			}, 500); // 500ms delay after user stops typing
		});

		// Handle script type change (simplified/traditional)
		$('input[name="script-type"]').on('change', function() {
			updateCharacter();
		});

		// Handle beginner character button clicks
		$('.char-btn').on('click', function(evt) {
			evt.preventDefault();
			var char = $(this).data('char');
			$('#character-select').val(char);
			sessionStorage.setItem('hanziguide_chars', char);
			updateCharacter();
		});

		// Handle beginner characters collapse/expand
		$('#beginner-chars-toggle').on('click', function() {
			var content = $('#beginner-chars-content');
			var icon = $('#beginner-chars-icon');
			
			if (content.is(':visible')) {
				content.slideUp(300);
				icon.css('transform', 'rotate(0deg)');
			} else {
				content.slideDown(300);
				icon.css('transform', 'rotate(180deg)');
			}
		});

		// Also handle form submission (Enter key)
		$('.js-char-form').on('submit', function(evt) {
			evt.preventDefault();
			clearTimeout(updateTimeout);
			updateCharacter();
		});

		$('#animate-play').on('click', function(evt) {
			evt.preventDefault();
			
			if (isPlaying) {
				// Pause
				isPlaying = false;
				$('#animate-play').html('<i class="fas fa-play"></i> Play').removeClass('btn-success').addClass('btn-primary');
				// Cancel ongoing animations
				animationWriters.forEach(function(writer) {
					try {
						writer.cancelAnimation();
					} catch(e) {}
				});
			} else {
				// Play
				isPlaying = true;
				$('#animate-play').html('<i class="fas fa-pause"></i> Pause').removeClass('btn-primary').addClass('btn-success');
				
				// Reset and animate all characters in sequence
				animationWriters.forEach(function(writer) {
					writer.hideCharacter();
				});
				currentStrokeIndex = 0;
				
				var animateNext = function(index) {
					// Check state before starting animation
					if (!isPlaying || index >= animationWriters.length) {
						// Stop and reset button
						isPlaying = false;
						$('#animate-play').html('<i class="fas fa-play"></i> Play').removeClass('btn-success').addClass('btn-primary');
						return;
					}
					
					var writer = animationWriters[index];
					var totalCharStrokes = writer._character ? writer._character.strokes.length : 0;
					var strokeIdx = 0;
					
            var animateStrokeByStroke = function() {
              if (!isPlaying) {
                return;
              }
              if (strokeIdx >= totalCharStrokes) {
                // Move to next character after a small gap
                var nextGap = 400 / strokeSpeedFactor;
                setTimeout(function() {
                  if (isPlaying) {
                    animateNext(index + 1);
                  }
                }, nextGap);
                return;
              }
							
            writer.animateStroke(strokeIdx, {
              duration: 1500 / strokeSpeedFactor,
                onComplete: function() {
                  currentStrokeIndex++;
                  strokeIdx++;
                  if (!isPlaying) return;
                  // Gap between strokes also depends on speed
                  var gap = 200 / strokeSpeedFactor;
                  setTimeout(function() {
                    if (isPlaying) {
                      animateStrokeByStroke();
                    }
                  }, gap);
                }
              });
            };
					
					animateStrokeByStroke();
				};
				
				animateNext(0);
			}
		});

    // Stroke speed slider
    var $speedSlider = $('#speed-slider');
    var $speedLabel = $('#speed-slider-label');
    if ($speedSlider.length) {
      $speedSlider.on('input change', function() {
        var val = parseFloat($(this).val()) || 1;
        strokeSpeedFactor = val;
        if ($speedLabel.length) {
          var text = val.toFixed(2).replace(/\.00$/, '').replace(/\.50$/, '.5');
          $speedLabel.text(text + '×');
        }
      });
    }

    $('#animate-next').on('click', function(evt) {
      evt.preventDefault();
      var totalStrokes = getTotalStrokes();
      if (currentStrokeIndex >= totalStrokes) return;
      currentStrokeIndex++;
      renderCurrentState(true);
    });

    $('#animate-prev').on('click', function(evt) {
      evt.preventDefault();
      if (currentStrokeIndex <= 0) return;
      currentStrokeIndex--;
      renderCurrentState(false);
    });

    $('#animate-reset').on('click', function(evt) {
      evt.preventDefault();
      currentStrokeIndex = 0;
      // Hide all strokes
      animationWriters.forEach(function(writer) {
        writer.hideCharacter();
      });
      var method = shouldShowOutline('animation') ? 'showOutline' : 'hideOutline';
      animationWriters.forEach(function(writer) {
        writer[method]();
      });
    });

		$('#animation-show-outline').on('click', function() {
			var method = shouldShowOutline('animation') ? 'showOutline' : 'hideOutline';
			animationWriters.forEach(function(writer) {
        writer[method]();
      });
		});

		// Add listeners for pronunciation checkboxes
		$('#show-mandarin, #show-cantonese').on('change', function() {
			updateCharacter();
		});

  // Handle draw mode toggle
  $('#draw-mode').on('change', function() {
    var isOn = $(this).is(':checked');
    var $speedWrapper = $('#speed-slider').closest('div');
    // Show slider only when NOT in draw mode
    if (isOn) {
      $speedWrapper.stop(true, true).fadeOut(200);
      startDrawMode();
    } else {
      $speedWrapper.stop(true, true).fadeIn(200);
      stopDrawMode();
    }
  });

    function startDrawMode() {
      // Disable navigation buttons in draw mode
      $('#animate-play, #animate-prev, #animate-next').prop('disabled', true);
      
      // Find which character and stroke we're on
      var strokeCount = 0;
      var targetWriter = null;
      var targetStrokeNum = null;
      
      for (var i = 0; i < animationWriters.length; i++) {
        var writer = animationWriters[i];
        var charStrokes = writer._character ? writer._character.strokes.length : 0;
        
        if (currentStrokeIndex < strokeCount + charStrokes) {
          targetWriter = writer;
          targetStrokeNum = currentStrokeIndex - strokeCount;
          break;
        }
        strokeCount += charStrokes;
      }
      
      if (!targetWriter) return;
      
      // Start quiz for just this stroke
      targetWriter.quiz({
        quizStartStrokeNum: targetStrokeNum,
        showHintAfterMisses: 2,
        highlightOnComplete: false,
        strokeFadeDuration: 0,
        onCorrectStroke: function() {
          // Advance to next stroke
          if (currentStrokeIndex < getTotalStrokes()) {
            currentStrokeIndex++;
            
            // Check if we need to move to next character's quiz
            if (currentStrokeIndex < getTotalStrokes()) {
              targetWriter.cancelQuiz();
              setTimeout(function() {
                if ($('#draw-mode').is(':checked')) {
                  startDrawMode();
                }
              }, 100);
            } else {
              // Completed all strokes
              $('#draw-mode').prop('checked', false);
              stopDrawMode();
            }
          }
        }
      });
    }
    
    function stopDrawMode() {
      $('#animate-play, #animate-prev, #animate-next').prop('disabled', false);
      animationWriters.forEach(function(writer) {
        writer.cancelQuiz();
      });
    }

    $('#share-btn').on('click', function(evt) {
      evt.preventDefault();
      var characters = $('#character-select').val().trim();
      if (!characters) {
        alert('Enter some characters first!');
        return;
      }
      
      var shareUrl = window.location.origin + '/#' + encodeURIComponent(characters);
      var shareText = 'Learn to write: ' + characters;
      
      // Use Web Share API if available (mobile)
      if (navigator.share) {
        navigator.share({
          title: 'Hanzi Guide',
          text: shareText,
          url: shareUrl
        }).catch(function(err) {
          if (err.name !== 'AbortError') {
            console.error('Share error:', err);
          }
        });
      } else {
        // Fallback: copy to clipboard
        var tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        // Show feedback
        var $btn = $(this);
        var originalText = $btn.html();
        $btn.html('✓ Link Copied!');
        setTimeout(function() {
          $btn.html(originalText);
        }, 2000);
      }
    });
	}
});
