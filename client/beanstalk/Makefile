all: put get

put:
	g++ put.cc -o put.exe -L .deps/beanstalk-client -lbeanstalk

get:
	g++ get.cc -o get.exe -L .deps/beanstalk-client -lbeanstalk

clean:
	rm -f *.exe
