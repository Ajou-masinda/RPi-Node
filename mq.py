import serial
import time

ser = serial.Serial('/dev/ttyUSB0', 9600)
while True:
	s = ser.read(11)
	if len(s) == 11:
		data = s.split(',')
		mq2 = int(data[0]) # GAS
		mq135 = int(data[1]) # CO2
		time.sleep(1)
	print "mq2 : ", mq2, "mq135 : ", mq135
	
	if mq2 >= 500 or mq135 >= 800 :
		pass
		# Android Notification Code	
