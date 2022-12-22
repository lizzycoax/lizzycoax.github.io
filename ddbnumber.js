function ddbnum(n) {
	this.type = "ddbnum"
	this.bas = n == null ? 0 : n.type === "ddbnum" ? n.bas : n
	this.num = () => this.bas
	this.under = n => ddbops.under(this, n)
	this.over = n => ddbops.over(this, n)
	this.min = n => ddbops.min(this, n)
	this.max = n => ddbops.max(this, n)
	this.floor = () => ddbops.floor(this)
	this.round = () => ddbops.round(this)
	this.ceil = () => ddbops.ceil(this)
	this.suc = () => ddbops.suc(this)
	this.pre = () => ddbops.pre(this)
	this.add = n => ddbops.add(this, n)
	this.sub = n => ddbops.sub(this, n)
	this.neg = () => ddbops.neg(this)
	this.mult = n => ddbops.mult(this, n)
	this.div = n => ddbops.div(this, n)
	this.inv = () => ddbops.inv(this)
	this.exp = n => ddbops.exp(this, n)
	this.log = n => ddbops.log(this, n)
}

const ddbops = {
	under: function(n1, n2) {
		return (n1.type === "ddbnum" ? n1.bas : n1) < (n2.type === "ddbnum" ? n2.bas : n2)
	}, over: function(n1, n2) {
		return (n1.type === "ddbnum" ? n1.bas : n1) > (n2.type === "ddbnum" ? n2.bas : n2)
	}, min: function(n1, n2) {
		return ddbops.under(n1, n2) ? new ddbnum(n1) : new ddbnum(n2);
	}, max: function(n1, n2) {
		return ddbops.over(n1, n2) ? new ddbnum(n1) : new ddbnum(n2);
	}, floor: function(n1) {
		let ddbn = new ddbnum(n1)
		ddbn.bas = Math.floor(ddbn.bas)
		return ddbn
	}, round: function(n1) {
		let ddbn = new ddbnum(n1)
		ddbn.bas = Math.round(ddbn.bas)
		return ddbn
	}, ceil: function(n1) {
		let ddbn = new ddbnum(n1)
		ddbn.bas = Math.ceil(ddbn.bas)
		return ddbn
	}, suc: function(n1) {
		let ddbn = new ddbnum(n1)
		ddbn.bas++
		return ddbn
	}, pre: function(n1) {
		let ddbn = new ddbnum(n1)
		ddbn.bas--
		return ddbn
	}, add: function(n1, n2) {
		let ddbn = new ddbnum(n1)
		ddbn.bas += (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	}, sub: function(n1, n2) {
		let ddbn = new ddbnum(n1)
		ddbn.bas -= (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	}, neg: function(n1) {
		let ddbn = new ddbnum(n1)
		ddbn.bas *= -1
		return ddbn
	}, mult: function(n1, n2) {
		let ddbn = new ddbnum(n1)
		ddbn.bas *= (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	}, div: function(n1, n2) {
		let ddbn = new ddbnum(n1)
		ddbn.bas /= (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	}, inv: function(n1) {
		let ddbn = new ddbnum(n1)
		ddbn.bas **= -1
		return ddbn
	}, exp: function(n1, n2) {
		let ddbn = new ddbnum(n1)
		ddbn.bas **= (n2.type === "ddbnum" ? n2.bas : n2)
		return ddbn
	}, log: function(n1, n2) {
		let ddbn = new ddbnum(n1)
		ddbn.bas = Math.log(ddbn.bas) / Math.log(n2)
		return ddbn
	}
}