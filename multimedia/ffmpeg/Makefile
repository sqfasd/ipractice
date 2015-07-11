all: simple_ffmpeg_streamer

simple_ffmpeg_streamer:
	gcc simple_ffmpeg_streamer.cc -g \
		-I /usr/local/include \
		-L /usr/local/lib \
		-o simple_ffmpeg_streamer.exe \
		-lavformat \
		-lavcodec \
		-lavutil \
		-lm \
		-lpthread \
		-lz \
		-lswresample \
		-lmp3lame \
		-llzma
