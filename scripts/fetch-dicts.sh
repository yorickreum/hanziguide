#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
assets_dir="${root_dir}/assets"

mkdir -p "${assets_dir}"

cedict_url="https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz"
cedict_gz="${assets_dir}/cedict_ts.u8.gz"
cedict_out="${assets_dir}/cedict_ts.u8"

echo "Downloading CC-CEDICT..."
curl -L --fail --retry 3 --retry-delay 5 --connect-timeout 30 --max-time 300 \
  "${cedict_url}" -o "${cedict_gz}"
gunzip -f "${cedict_gz}"
ls -lh "${cedict_out}"

cccanto_url="https://cantonese.org/cccanto-170202.zip"
cccanto_zip="${assets_dir}/cccanto.zip"
cccanto_out="${assets_dir}/cccanto.u8"

echo "Downloading CC-Canto..."
curl -L --fail --retry 3 --retry-delay 5 --connect-timeout 30 --max-time 300 \
  "${cccanto_url}" -o "${cccanto_zip}"
unzip -o "${cccanto_zip}" -d "${assets_dir}"
mv "${assets_dir}/cccanto-webdist.txt" "${cccanto_out}"
rm "${cccanto_zip}"
ls -lh "${cccanto_out}"

unihan_url="https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"
unihan_zip="${assets_dir}/unihan.zip"
unihan_dir="${assets_dir}/unihan"
kids_out="${assets_dir}/kids.json"
radicals_out="${assets_dir}/radicals.json"
radical_bases_out="${assets_dir}/radical-bases.json"
cjk_decomp_url="https://raw.githubusercontent.com/amake/cjk-decomp/master/cjk-decomp.txt"
cjk_decomp_file="${assets_dir}/cjk-decomp.txt"

echo "Downloading Unihan..."
curl -L --fail --retry 3 --retry-delay 5 --connect-timeout 30 --max-time 300 \
  "${unihan_url}" -o "${unihan_zip}"
rm -rf "${unihan_dir}"
unzip -o "${unihan_zip}" -d "${unihan_dir}"

echo "Downloading cjk-decomp..."
curl -L --fail --retry 3 --retry-delay 5 --connect-timeout 30 --max-time 300 \
  "${cjk_decomp_url}" -o "${cjk_decomp_file}"

node "${root_dir}/scripts/build-kids.js" "${cjk_decomp_file}" "${kids_out}"
ls -lh "${kids_out}"

node "${root_dir}/scripts/build-radicals.js" "${unihan_dir}/Unihan_IRGSources.txt" "${radicals_out}"
ls -lh "${radicals_out}"

node "${root_dir}/scripts/build-radical-bases.js" "${radical_bases_out}"
ls -lh "${radical_bases_out}"
