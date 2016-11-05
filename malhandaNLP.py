#! /usr/bin/python2.7
# -*- coding: utf-8 -*-

from konlpy.tag import Mecab
from UnicodePrinter import UnicodePrinter
import sys
import re

mecab = Mecab()

result = UnicodePrinter().pformat(mecab.pos(sys.argv[1].decode('utf-8')))
print re.sub(r"\n", "", result)