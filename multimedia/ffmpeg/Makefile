all: simple_ffmpeg_streamer

simple_ffmpeg_streamer:
	gcc simple_ffmpeg_streamer.cc -g \
		-o simple_ffmpeg_streamer.exe \
		-lavformat \
		-lavcodec \
		-lavutil \
		-lm \
		-lpthread \
		-lz \
		-lswresample
