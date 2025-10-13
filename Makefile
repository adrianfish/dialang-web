build:
	cp -r ../common .
	docker build -t adrianfish/dialang-web .
	rm -rf common/
