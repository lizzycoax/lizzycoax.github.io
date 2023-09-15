$num = (a) => (
	{neg: null, inv: null, num: a, tet: 0}
);

$add = (a, b) => a + b;

$suc = (a) => a + 1;

$sub = (a, b) => a - b;

$pre = (a) => a - 1;

$neg = (a) => -a;

$mul = (a, b) => 	a * b;

$div = (a, b) => a / b;

$inv = (a) => 1 / a;

$exp = (a, b) => a ** b;

$roo = (a, b) => b ** (1 / a);

$log = (a, b) => Math.log(b) / Math.log(a);

$min = (a, b) => Math.min(a, b);

$max = (a, b) => Math.max(a, b);

$cla = (a, b, c) => Math.max(a, Math.min(b, c));

$abs = (a) => Math.abs(a);

$flo = (a) => Math.floor(a);

$rou = (a) => Math.round(a);

$cei = (a) => Math.ceil(a);

$mor = (a, b) => a > b;

$mte = (a, b) => a >= b;

$les = (a, b) => a < b;

$lte = (a, b) => a <= b;

$sig = (a) => a > 0 ? 1 : a < 0 ? -1 : 0;

fmod = (a, b) => a - Math.floor(a / b) * b;

base = 10;

$strFuncs = {
	decStr: (num, mag, dot) =>
		dot >= 0 ? "" :
			(
				"." + (
					"0".repeat((mag + 3) - dot + 1)
				+ num.toString(base)).substr(dot)
			),
	sepStr: (num, dot) =>
		num == 0 ? "0" : ((len) =>
			(
				"000".substr(len) + num.toString(base)
			).match(/.{1,3}/g).join(",").replace(/^0+/g, "")
		)(fmod(num.toString(base).length + dot - 1, 3) + 1),
	floatStr: (num, mag, dot) =>
		$strFuncs.sepStr(
			Math.floor(num + base ** dot * 0.5), 0
		) + (num == Math.floor(num) ? "" : $strFuncs.decStr(
			Math.round((num - Math.floor(num)) * base ** -dot), mag, dot
		)),
};

$str = (a) =>
	a == 0 ? "0" : ((magH, mag, dot) =>
		magH < 0 ?
			$strFuncs.floatStr(
				a * base ** -mag, 0, dot - mag
			) + "e" + mag.toString(base) :
		dot > 0 ?
			$strFuncs.sepStr(
				Math.round(a * base ** -dot, 0), dot
			) + "e" + dot.toString(base) :
			$strFuncs.floatStr(a, mag, dot)
	)(
		Math.round(Math.log(a * 1000) / Math.log(base)),
		Math.round(Math.log(a) / Math.log(base)),
		Math.round(Math.log(a / 100000) / Math.log(base))
	);
