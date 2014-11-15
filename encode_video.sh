#!/bin/bash
rm data/base64Images
rm videos/*.jpeg
# ffmpeg -i qa.mp4 -r 30 -vf scale=1280:-1 -qscale:v 1 thumbnails-%05d.jpeg
ffmpeg -i videos/myspace.mp4 -r 23 -vf scale=640:-1 -qscale:v 15 videos/thumbnails-%05d.jpeg

FILES=videos/*.jpeg
for f in $FILES
do
  echo "Processing $f file..."
  # take action on each file. $f store current file name
  base64 $f >> data/base64ImagesMySpace
done
