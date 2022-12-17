const ddbnum = {
	new: function(n) {
		let ddbn = {
			type: "ddbnum",
			bas: n == null ? 0 : n.type === "ddbnum" ? n.bas : n,
			num: function() {
				return ddbn.bas
			},
			under: function(n) {
				return ddbnum.under(ddbn, n)
			},
			over: function(n) {
				return ddbnum.over(ddbn, n)
			},
			min: function(n) {
				return ddbnum.min(ddbn, n)
			},
			max: function(n) {
				return ddbnum.max(ddbn, n)
			},
			add: function(n) {
				return ddbnum.add(ddbn, n)
			},
			sub: function(n) {
				return ddbnum.sub(ddbn, n)
			},
			neg:function() {
				return ddbnum.neg(ddbn)
			},
			mult: function(n) {
				return ddbnum.mult(ddbn, n)
			},
			div: function(n) {
				return ddbnum.div(ddbn, n)
			},
			inv: function() {
				return ddbnum.inv(ddbn)
			},
			exp: function(n) {
				return ddbnum.exp(ddbn, n)
			}
		}
		return ddbn
	},
	under: function(n1, n2) {
		return (n1.type === "ddbnum" ? n1.bas : n1) < (n2.type === "ddbnum" ? n2.bas : n2)
	},
	over: function(n1, n2) {
		return (n1.type === "ddbnum" ? n1.bas : n1) > (n2.type === "ddbnum" ? n2.bas : n2)
	},
	min: function(n1, n2) {
		if (ddbnum.under(n1, n2))
			return ddbnum.new(n1)
		else
			return ddbnum.new(n2)
	},
	max: function(n1, n2) {
		if (ddbnum.over(n1, n2))
			return ddbnum.new(n1)
		else
			return ddbnum.new(n2)
	},
	add: function(n1, n2) {
		let ddbn = ddbnum.new(n1)
		ddbn.bas += (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	},
	sub: function(n1, n2) {
		let ddbn = ddbnum.new(n1)
		ddbn.bas -= (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	},
	neg: function(n1) {
		let ddbn = ddbnum.new(n1)
		ddbn.bas *= -1
		return ddbn
	},
	mult: function(n1, n2) {
		let ddbn = ddbnum.new(n1)
		ddbn.bas *= (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	},
	div: function(n1, n2) {
		let ddbn = ddbnum.new(n1)
		ddbn.bas /= (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	},
	inv: function(n1) {
		let ddbn = ddbnum.new(n1)
		ddbn.bas **= -1
		return ddbn
	},
	exp: function(n1, n2) {
		let ddbn = ddbnum.new(n1)
		ddbn.bas **= (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	}
}