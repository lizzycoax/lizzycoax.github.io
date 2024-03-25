//hei is always an integer of 0 or gte
//val is always between log(MAX_VALUE) and MAX_VALUE when hei is above 0
//infinity has hei Infinity

//the math relies HEAVILY on the amount of precision and the above rules lmfao

$bignum = {
	sff: (num, dig) =>
		(num < 0 ? "-" : "") + (
			(
				"" + Math.floor(Math.abs(num) + 10 ** -dig / 2)
			).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		) + (
			dig > 0 ? "." + (
				"0".repeat(dig) + Math.round(Math.abs(num) * 10 ** dig)
			).substr(-dig) : ""
		),
	sfe: (num, dig) =>
		(m =>
			(dig =>
				m.gte(-dig - .5) && m.lt(dig + .5) ?
					$bignum.sff(num.val, Math.round(dig - m.val)) :
					$bignum.sff(
						num.div(new Big(Math.round(m.val)).exp(10)).val,
						dig) +
					"e" + $bignum.sff(Math.round(m.val), 0)
			)(dig - Math.max(0, Math.round(m.log(10).val)))
		)(num.mul(num.lt(0) ? -1 : 1).log(10).max(0)),
	ln: (n) => Math.log(n),
	lln: (n) => Math.log($bignum.ln(n)),
	llln: (n) => Math.log($bignum.lln(n)),
	ptc: (num, bas) =>
		((a, hei) => (
			bas > Math.E ? (
				hei >= 3 && (a = a.smn($bignum.llln(bas))),
				hei >= 2 && (a = a.sub($bignum.lln(bas))),
				hei >= 1 && (a = a.div($bignum.ln(bas))),
				bas ** a.val != Infinity && hei > 0 && (a.val = bas ** a.val, hei--)
			) : (
				hei >= 3 && (a = a.smp($bignum.lln(1 / $bignum.ln(bas)))),
				hei >= 2 && (a = a.add($bignum.ln(1 / $bignum.ln(bas)))),
				hei >= 1 && (a = a.mul(1 / $bignum.ln(bas))),
				a.hei == 1 && (a = a.log(bas), hei++)
			),
			[a.val, hei]
		))(new Big(num.val), num.hei),
	ld: (n) => Math.log(n) * Math.LOG10E,
	lnd: Math.log(10),
	str: (a, dig) =>
		a.val == 0 || !Number.isFinite(a.val) ? "" + a.val :
		a.log(10).lt(dig + .5) ?
			$bignum.sff(a.val,
				a.val % 1 == 0 ? 0 :
					Math.round(Math.round(dig - Math.max(0, a.log(10).val)) / 3), 2
			) :
		(([val, hei]) =>
			a.lt($bignum.enm) ? ((num) => (
				num.log(10).lt(dig + .5) &&
					((num = num.exp(10)), hei--),
				"e".repeat(hei) + $bignum.sfe(num, dig)
			))(new Big(val)) : (
				((f) => f(f))((f) => {
					val <= 0 ? (
						val = 10 ** val,
						hei--,
						f(f)
					) : val <= 1 ? (
						val =
							(2 * $bignum.lnd) / (1 + $bignum.lnd) * val +
							(1 - $bignum.lnd) / (1 + $bignum.lnd) * val ** 2
					) : (
						val = $bignum.ld(val),
						hei++,
						f(f)
					)
				}),
				"10^^" + $bignum.str(new Big(hei - 1 + val), dig)
			)
		)($bignum.ptc(a, 10)),
}

class Big {
	constructor(n) {
		this.val = n instanceof Big ? n.val : n;
		this.hei = n instanceof Big ? n.hei : n == Infinity ? Infinity : 0;
	}
	cmp(n) {
		return ((a, b) =>
			a.hei > b.hei ? 1 :
			a.hei < b.hei ? -1 :
			a.val > b.val ? 1 :
			a.val < b.val ? -1 : 0
		)(new Big(this), new Big(n));
	}
	gsp(n) {
		return ((a, b) =>
			((sgn) => [
				sgn == -1 ? b : a,
				sgn == -1 ? a : b
			])(a.cmp(b))
		)(new Big(this), new Big(n));
	}
	smp(n) {
		return (([a, b]) =>
			a.hei >= 1 ? a : (
				a.val += Math.log1p(Math.exp(b.val - a.val)),
				a
			)
		)(this.gsp(n));
	}
	smn(n) {
		return ((a, b) =>
			a.hei >= 1 ? a : (
				a.val += Math.log1p(-Math.exp(b.val - a.val)),
				a
			)
		)(new Big(this), new Big(n));
	}
	add(n) {
		return (([a, b]) =>
			b.hei == 0 && b.val < 0 ? a.sub(-b.val) :
			a.hei >= 2 && Number.isFinite(b.val) ? a :
			a.hei == 1 || a.val + b.val == Infinity ? (
				a = a.log(),
				b = b.log(),
				a.smp(b).exp()
			) : (a.val += b.val, a)
		)(this.gsp(n));
	}
	sub(n) {
		return ((a, b) =>
			a.hei == b.hei && a.val == b.val ? new Big(0) :
			b.hei == 0 && b.val < 0 ? a.add(-b.val) :
			(([a, b], sgn) => (
				a.hei >= 2 || (
					a.hei == 1 ? (
						a = a.log(),
						b = b.log(),
						a = a.smn(b).exp()
					) : a.val -= b.val
				), (
					a.hei == 1 && Math.exp(a.val) != Infinity &&
						(a.hei--, a.val = Math.exp(a.val)),
					sgn == -1 && (
						a.hei >= 1 && (a.hei = 0, a.val = Infinity),
						a.val = -a.val
					),
					a
				)
			))(a.gsp(b), a.cmp(b))
		)(new Big(this), new Big(n));
	}
	mul(n) {
		return (([a, b]) =>
			b.hei == 0 && Math.abs(b.val) < 1 ? a.div(1 / b.val) :
			a.hei >= 3 && Number.isFinite(b.val) ? (
				 b.lt(0) && (a.hei = 0, a.val = -Infinity),
				 a
			) :
			a.hei >= 1 || a.hei == 0 && a.val * b.val == Infinity && (
				a.hei++, a.val = Math.log(a.val), true
			) ? ((sgn) => (
				a.hei--,
				b.val *= sgn,
				b.hei == 0 ? b.val = Math.log(b.val) : b.hei--,
				a = a.add(b),
				a.hei++,
				sgn == -1 && (
					a.hei >= 1 ? (a.hei = 0, a.val = -Infinity) : a.val = -a.val
				),
				a
			))(Math.sign(b.val)) : (a.val *= b.val, a)
		)(this.gsp(n));
	}
	div(n) {
		return ((a, b) =>
			b.hei == 0 && Math.abs(b.val) < 1 ? a.mul(1 / b.val) :
			a.hei >= 3 && a.gt(b) && Number.isFinite(b.val) ? (
				 b.lt(0) && (a.hei = 0, a.val = -Infinity),
				 a
			) :
			a.hei >= 1 ? ((sign) => (
				a.hei--,
				b.val *= sign,
				b.hei == 0 ? b.val = Math.log(b.val) : b.hei--,
				a = a.sub(b),
				a.hei++,
				Math.exp(a.val) != Infinity && (a.hei--, a.val = Math.exp(a.val)),
				sign == -1 && (
					a.hei >= 1 ? (a.hei = 0, a.val = -Infinity) : a.val = -a.val
				),
				a
			))(Math.sign(b.val)) : (a.val /= b.val, a)
		)(new Big(this), new Big(n));
	}
	pow(n) {
		return ((a, b) =>
			a.hei == 0 && b.hei == 0 && a.val ** b.val != Infinity ? (
				a.val **= b.val,
				a
			) : b.exp(a)
		)(new Big(this), new Big(n));
	}
	exp(n) {
		return ((a, b) => (
			Math.abs(b.val) < 1 ? a.mul(-1).exp(1 / b.val) : (
				b && (
					b.hei == 0 ? b.val = Math.log(b.val) : b.hei--,
					a = a.mul(b)
				),
				Math.exp(a.val) == Infinity ? a.hei++ : a.val = Math.exp(a.val),
				a
			)
		))(new Big(this), n != undefined && new Big(n));
	}
	log(n) {
		return ((a, b) => (
			a.hei == 0 ? a.val = Math.log(a.val) : a.hei--,
			b && (a = a.div(b.log())),
			a
		))(new Big(this), n != undefined && new Big(n));
	}
	min(n) {return this.gsp(n)[1];}
	max(n) {return this.gsp(n)[0];}
	gt(n) {return this.cmp(n) == 1;}
	lte(n) {return this.cmp(n) != 1;}
	eq(n) {return this.cmp(n) == 0;}
	neq(n) {return this.cmp(n) != 0;}
	lt(n) {return this.cmp(n) == -1;}
	gte(n) {return this.cmp(n) != -1;}
	str(n) {
		return ((sign) =>
			(sign == -1 ? "-" : "") + $bignum.str(this.mul(sign), n || 6)
		)(this.cmp(0));
	}
	flo() {
		return (n =>
			n.hei > 0 ? n : new Big(Math.floor(n.val))
		)(new Big(this));
	}
	rou() {
		return (n =>
			n.hei > 0 ? n : new Big(Math.round(n.val))
		)(new Big(this));
	}
	cei() {
		return (n =>
			n.hei > 0 ? n : new Big(Math.ceil(n.val))
		)(new Big(this));
	}
	mod(n) {
		return ((a, b) =>
			a.sub(a.div(b).flo().mul(b))
		)(new Big(this), new Big(n));
	}
}

Big.cmp = (a, b) => new Big(a).cmp(b);
Big.gsp = (a, b) => new Big(a).gsp(b);
Big.smp = (a, b) => new Big(a).smp(b);
Big.smn = (a, b) => new Big(a).smn(b);
Big.add = (a, b) => new Big(a).add(b);
Big.sub = (a, b) => new Big(a).sub(b);
Big.mul = (a, b) => new Big(a).mul(b);
Big.div = (a, b) => new Big(a).div(b);
Big.pow = (a, b) => new Big(a).pow(b);
Big.exp = (a, b) => new Big(a).exp(b);
Big.log = (a, b) => new Big(a).log(b);
Big.min = (a, b) => new Big(a).min(b);
Big.max = (a, b) => new Big(a).max(b);
Big.gt = (a, b) => new Big(a).gt(b);
Big.lte = (a, b) => new Big(a).lte(b);
Big.eq = (a, b) => new Big(a).eq(b);
Big.neq = (a, b) => new Big(a).neq(b);
Big.lt = (a, b) => new Big(a).lt(b);
Big.gte = (a, b) => new Big(a).gte(b);
Big.str = (a) => new Big(a).str();
Big.flo = (a) => new Big(a).flo();
Big.rou = (a) => new Big(a).rou();
Big.cei = (a) => new Big(a).cei();
Big.mod = (a, b) => new Big(a).mod(b);

$bignum.enm = new Big(6.5).exp(10).exp(10).exp(10).exp(10);