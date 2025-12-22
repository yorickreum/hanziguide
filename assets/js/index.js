// Integrated demo logic from demo.js
var animationWriters = [];
var currentStrokeIndex = 0;
var updateTimeout = null;
var isPlaying = false;
var animationPromise = null;

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

function updateCharacter() {
  var inputText = $('#character-select').val().trim();
  if (!inputText) {
    $('#animation-target').html('<p style="padding: 20px; color: #999;">Enter characters above to see them here</p>');
    animationWriters = [];
    return;
  }

  var scriptType = getScriptType();
  var characters = convertText(inputText, scriptType);

  $('#animation-target').html('');

  // Clear old writers
  animationWriters = [];
  currentStrokeIndex = 0;

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
      showCharacter: false
    });
    
    // Try to access character data after writer is created
    setTimeout(function() {
      // Use pinyin-pro library to get pronunciation
      try {
        if (typeof pinyinPro !== 'undefined') {
          var pinyinText = pinyinPro.pinyin(char, { toneType: 'symbol' });
          if (pinyinText) {
            pinyinDiv.textContent = pinyinText;
            pinyinDiv.style.display = 'block';
            console.log('Pinyin for ' + char + ':', pinyinText);
          } else {
            console.log('No pinyin found for', char);
          }
        } else {
          console.error('pinyinPro library not loaded');
        }
      } catch(e) {
        console.error('Error getting pinyin:', e);
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

function renderCurrentState(animate) {
  if (animationWriters.length === 0) return;
  
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
							// Move to next character
							setTimeout(function() {
								if (isPlaying) {
									animateNext(index + 1);
								}
							}, 300);
							return;
						}
						
						writer.animateStroke(strokeIdx, {
							onComplete: function() {
								currentStrokeIndex++;
								strokeIdx++;
								if (isPlaying) {
									animateStrokeByStroke();
								}
							}
						});
					};
					
					animateStrokeByStroke();
				};
				
				animateNext(0);
			}
		});

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

    $('#draw-mode').on('change', function() {
      var drawMode = $(this).is(':checked');
      if (drawMode && animationWriters.length > 0) {
        startDrawMode();
      } else {
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
      
      var shareUrl = window.location.origin + '/' + characters;
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
