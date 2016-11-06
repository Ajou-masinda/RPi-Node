#! /usr/bin/python2.7
# -*- coding: utf-8 -*-

from konlpy.tag import Twitter
from UnicodePrinter import UnicodePrinter
import sys
import re

twitter = Twitter()

result = UnicodePrinter().pformat(twitter.pos(sys.argv[1].decode('utf-8')))
print re.sub(r"\n", "", result)