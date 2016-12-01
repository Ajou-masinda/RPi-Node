import lirc
import os
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--device', type=str)
parser.add_argument('--command', type=str)

args = parser.parse_args()

DEVICE = args.device
COMMAND = args.command

os.system("irsend " + "SEND_ONCE " + DEVICE +" "+COMMAND )
