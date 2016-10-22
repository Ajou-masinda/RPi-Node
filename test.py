#! /usr/bin/python2.7
# -*- coding: utf-8 -*-

from konlpy.tag import Mecab
from konlpy.utils import pprint
import sys

mecab = Mecab()
print(sys.argv[1])
pprint(mecab.pos(sys.argv[1].decode("utf-8")))
