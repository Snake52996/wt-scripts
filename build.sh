#!/bin/bash
rm --recursive --force ./build/
find . -maxdepth 1 -type f -regex '\./user-script-[0-9]+\.js' -exec \
	bun --outdir build \
			--target browser \
			--format esm \
			--production \
			--minify \
			'{}' '+'