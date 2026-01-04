#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
assets_dir="${root_dir}/assets"
fonts_dir="${assets_dir}/fonts"

mkdir -p "${fonts_dir}"

hanamin_release="4.082"
hanamin_base_url="https://github.com/cjkvi/HanaMinAFDKO/releases/download/${hanamin_release}"
hanamin_zip="${fonts_dir}/HanaMinAFDKO-${hanamin_release}.zip"
hanamin_ext_zip="${fonts_dir}/HanaMinExtAFDKO-${hanamin_release}.zip"

hanamin_a_out="${fonts_dir}/HanaMinA.otf"
hanamin_b_out="${fonts_dir}/HanaMinB.otf"
hanamin_ext_a_out="${fonts_dir}/HanaMinAX.otf"
hanamin_ext_b_out="${fonts_dir}/HanaMinBX.otf"

echo "Downloading HanaMin base fonts..."
curl -L --fail --retry 3 --retry-delay 5 --connect-timeout 30 --max-time 600 \
  "${hanamin_base_url}/HanaMinAFDKO-${hanamin_release}.zip" -o "${hanamin_zip}"
unzip -o "${hanamin_zip}" -d "${fonts_dir}"

echo "Downloading HanaMinExt fonts..."
curl -L --fail --retry 3 --retry-delay 5 --connect-timeout 30 --max-time 600 \
  "${hanamin_base_url}/HanaMinExtAFDKO-${hanamin_release}.zip" -o "${hanamin_ext_zip}"
unzip -o "${hanamin_ext_zip}" -d "${fonts_dir}"

rm -f "${hanamin_zip}" "${hanamin_ext_zip}"

ls -lh "${hanamin_a_out}" "${hanamin_b_out}" "${hanamin_ext_a_out}" "${hanamin_ext_b_out}" 2>/dev/null || true
