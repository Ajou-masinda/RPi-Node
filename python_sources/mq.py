#! /usr/bin/python2.7
# -*- coding: utf-8 -*-

import serial
import time
import sys

ser = serial.Serial('/dev/ttyUSB0', 9600)
while True:
	s = ser.read(11)
	if len(s) == 11:
		data = s.split(',')
		mq2 = int(data[0]) # GAS
		mq135 = int(data[1]) # CO2
		time.sleep(1)
	print "{\"mq2\" : ", mq2, ",\"mq135\" : ", mq135 , "}"
	sys.stdout.flush()		