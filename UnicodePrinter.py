import pprint as pp
import sys

class UnicodePrinter(pp.PrettyPrinter):
	def format(self, object, context, maxlevels, level):
		"""Overrided method to enable Unicode pretty print."""
		if isinstance(object, unicode):
			encoding = sys.stdout.encoding or 'utf-8'
			return (object.encode(encoding), True, False)
		return pp.PrettyPrinter.format(self, object, context, maxlevels, level)
		
		import UnicodePrinter