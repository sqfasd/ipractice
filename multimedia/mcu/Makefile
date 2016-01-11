all: mcu

mcu:
	g++ server.cc \
		connection.cc \
		-std=c++11 \
		-pthread \
		-g \
		-I ../../ \
		-o mcu.exe
