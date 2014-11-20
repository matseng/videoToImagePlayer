#!/bin/bash
rm audio/myspace.aac
rm data/base64MySpaceAudio
# ffmpeg -i qa.mp4 -r 30 -vf scale=1280:-1 -qscale:v 1 thumbnails-%05d.jpeg
ffmpeg -i videos/myspace.mp4 -strict -2 audio/myspace.aac

# FILES=videos/*.jpeg
# for f in $FILES
# do
# echo "Processing $f file..."
# take action on each file. $f store current file name
base64 audio/myspace.aac >> data/base64MySpaceAudio
# done
