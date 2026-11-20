recurse = i =>
(
	i <= 3
	? (
		base2.some((x, i) => i >= 8 && x)
		? (
			base2[i] = base2[i + 1] ? 2 : 1,
			base2 = base2.map((x, j) => j < i ? 2 : x)
		)
		: (
			base2[i] = i <= 2 && base2[i + 2] ? 1 : Math.floor(base2[i] / b),
			base2 = base2.map((x, j) => j < i ? 1 : x)
		)
	)
	: i <= 9
	&& (
		base2[0] = i == 4 ? base2.some((x, i) => i >= 8 && x) ? 6 : 5
			: i == 7 ? base2.some((x, i) => i >= 8 && x) ? 4 : 5
			: i >= 8 && i <= 9 ? base2[i] : base2[i] + 1,
		base2 = base2.map((x, j) => j > 0 && j <= i ? 0 : x)
	),
	base2[i + 1]++
);

nodeclick = i =>
(
	nodes[i + 1]
	&& (
		nodes[i + 1].title.innerHTML = names[i + 1],
		nodes[i + 1].button.classList.remove("locked")
	),
	i != unlocked && mode >= 1
	? (
		[base2[i + 2], nodes[i].n] =
		[
			base2[i + 2] - (mode == 1 ? 1
				: Math.min(base2[i + 2], 60 - nodes[i].n)),
			Math.min(nodes[i].n + (mode == 1 ? 1 : base2[i + 2]), 60)
		]
	)
	: (
		i == unlocked
		&& (
			unlocked++,
			make.innerHTML = `Compute ${unlocked - 3} bytes of data`,
			b > 4
			&& (
				b--,
				progress = progress.map(() => 0),
				nodes.forEach(x => x.n = 0),
				completed = 0, base = 0, reset()
			)
		),
		recurse(i),
		lgoogol = 0
	)
);

autop = i =>
(
	i <= 2
	? (
		base2.some((x, i) => i >= 8 && x)
		? (
			progress[i] += Math.min(base2[i], b),
			progress[i + 1] = Math.max(
				Math.floor((progress[i] - 2) / (b - 2)), 0),
			base2[i] = Math.floor((progress[i] - 2) % (b - 2)) + 2
		)
		: (
			progress[i] += Math.min(base2[i], b),
			progress[i + 1] = Math.max(
				Math.floor((progress[i] - 1) / (b - 1)), 0),
			base2[i] = Math.floor((progress[i] - 1) % (b - 1)) + 1
		)
	)
	: i == 3 || i >= 7 && i <= 8
	? (
		progress[i] += Math.min(base2[i], b),
		progress[i + 1] = Math.floor(progress[i] / b),
		base2[i] = progress[i] % b
	)
	: i >= 4 && i <= 6
	&& (
		progress[i] += Math.min(base2[i], b - 1),
		progress[i + 1] = Math.floor(progress[i] / (b - 1)),
		base2[i] = progress[i] % (b - 1)
	)
);

gain2 = d =>
(
	progress[0] += machines.map((x, i) => persec(i) * x.n)
		.reduce((x, y) => x + y, 0) * d,
	nodes.forEach((node, i) => progress[i + 1] += node.n * d),
	progress.forEach((x, i) =>
	(
		i < completed ? autop(i)
		: i == completed ? base2[i] += Math.floor(progress[i])
		: (
			base2[i - 1] >= (i >= 6 && i <= 8 ? b - 1 : b) && progress[i] >= 1
				&& (recurse(i - 1), progress[i] = 0)
		)
	)),
	progress[0] %= 1
);

ord = (num, seq) =>
(
	Array(3).fill(0).map((x, i) => base2[8 + i]).map((x, i) =>
	(
		!seq || base2.some((x, j) => j >= 8 && j < i + 8 && x) ? x
		: x ? x - 1 : i <= 1 && !x && base2[9 + i] ? 1 : x
	)
	).map((x, i) =>
	(
		x && ("ω" + (i == 0 ? "" : `<sup>${i + 1}</sup>`) + (x == 1 ? "" : x))
	)
	).filter(x => x).reverse().join(" + ")
	+ (seq && !base2[8] ? " × " : " + ") + num
);

display2 = d =>
(
	(lgoogol -= d, lgoogol <= 0)
	&& (
		lgoogol = 1.5,
		googol.innerHTML =
			Array(3).fill(0).reduce((x, y, i) =>
			(
				(base2[i + 5] == 0 ? ""
					: (base2[i + 5] == 1 ? "" : "(") + b
					+ (base2.some((x, i) => i >= 8 && x)
						? `↑<sup>${ord(i + 1)}</sup>`
						: "↑".repeat(i + 2))
					+ (base2[i + 5] == 1 ? "" : ")"
					+ "<sup>" + base2[i + 5] + "</sup>")
				+ "(") + x + (base2[i + 5] == 0 ? "" : ")")
			),
			(x =>
			(
				base2.some((x, i) => i >= 8 && x)
					? `${b}↑<sup>${ord(x + base2[0], true)}</sup>${b}`
					: base2[0] + x
			)
			)(Array(4).fill(0).reduceRight((x, y, i) =>
			(
				base2[i + 1] == 0 ? ""
				: base2.some((x, i) => i >= 8 && x)
				? `${b}↑<sup>${ord(x + base2[i + 1], true)}</sup>`
				: unlocked >= 5 || base2[i + 1] >= 30 || i < 3 && base2[i + 2]
				? `×${b}<sup>${base2[i + 1] + x}</sup>`
				: "0".repeat(base2[i + 1]) + x
			),
			"")))
	)
);

updtree = () =>
(
	nodepre.innerHTML = base2[0],
	nodes.forEach((node, i) =>
	(
		node.info.innerHTML =
			i > unlocked || node.title.innerHTML == "" ? ``
			: i == unlocked ? b == 4 ? `` : `prestige`
			: i + 1 <= completed ? mode == 0 ? base2[i + 1] : `instant`
			: `${base2[i + 1]}`
			+ (mode == 0 && node.n == 0 ? "" : `, ${node.n}/s`)
	))
);

enable2 = () =>
(
	nodes.forEach((node, i) =>
	(
		i < completed
			? node.button.classList.add("completed")
			: node.button.classList.remove("completed"),
		i <= unlocked && i + 1 > completed &&
			(i == unlocked || mode == 0
				? base2[i] >= (i >= 5 && i <= 7 ? b - 1 : b)
				: i + 1 < names.length && base2[i + 2] >= 1)
			? node.button.removeAttribute("disabled")
			: node.button.setAttribute("disabled", true)
	))
);

complete = () =>
	nodes.forEach((node, i) =>
		node.n == 60 && completed == i && completed++);

nodes = (saved =>
	saved ? JSON.parse(saved) : names.map((x, i) => ({n: 0, locked: i > 0}))
)(localStorage.getItem("nodes"));

tree.innerHTML =
	[
		[-1], [0], [1, 4], [2, 5], [3, 6], [7], [8], [9]
	]
	.map(x =>
	(
		`<div class="inner xcenter"><div class="inner horizontal">`
		+ x.map(i =>
		(
			i == null ? `<div></div>`
			: i == -1
			? `<button id="nodepre" class="node empty" disabled></button>`
			: `<button id="node${i}" class="node${nodes[i].locked
			? " locked" : ""}"onclick="nodeclick(${i})" disabled>`
			+ `<span id="name">${nodes[i].locked ? "" : names[i]}</span>`
			+ `<br><span id="info" class="small">0/s</span></button>`
		)
		).join("") + `</div></div>`
	)
	).join("");

nodes =
	nodes.map((x, i) =>
	({
		n: x.n, name: names[i], button: document.querySelector(`#node${i}`)
	}))
	.map((x, i) =>
	({
		...x, info: x.button.querySelector(`#info`),
		title: x.button.querySelector(`#name`)
	}));

(buttons =>
(
	buttons.forEach((button, i) =>
	(
		button.onclick = () =>
		(
			mode = i,
			buttons.forEach(button =>
			(
				button.removeAttribute("disabled"),
				button.setAttribute("class", "unselected")
			)),
			button.setAttribute("disabled", true),
			button.setAttribute("class", "selected")
		)
	))
)
)([manual, auto, mauto]);

(l => l && (gain2((new Date().getTime() - JSON.parse(l)) / 1000)))(
	localStorage.getItem("time"));

(f => f(f)(0)(0)(0))(f => b => l => t =>
	(gain2(b / 1000), complete(), display2(b / 1000), updtree(), enable2(),
		requestAnimationFrame(f(f)(t - l)(t))));
