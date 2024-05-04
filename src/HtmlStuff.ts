function renderHtml() {
	const line = document.querySelector('.line');
	const aboutBtn = document.querySelector('#About');
	const trackBtn = document.querySelector('#Track');
	const trackList = document.querySelector('.musicList');
	const articleList = document.querySelector('.articleList');
	const time = document.querySelectorAll('.time');
	const nowPlaying = document.querySelectorAll('.nowPlaying');
	const trackItem = document.querySelectorAll('.trackItem');
	const Tracks = document.querySelectorAll('audio');

	aboutBtn?.addEventListener('click', () => {
		if (line?.classList.contains('.moveRight')) return;
		// when i clic kthe about button the other text must hide

		line?.classList.add('moveRight');

		trackList?.classList.remove('unhide');
		trackList?.classList.add('hide');

		articleList?.classList.remove('hide');
		articleList?.classList.add('unhide');
		document.getElementById('trackList')!.style.display = 'none';
		setTimeout(() => {
			document.getElementById('articleList')!.style.display = 'block';
		}, 150);
	});

	trackBtn?.addEventListener('click', () => {
		line?.classList.remove('moveRight');

		trackList?.classList.remove('hide');
		trackList?.classList.add('unhide');

		articleList?.classList.remove('unhide');
		articleList?.classList.add('hide');

		setTimeout(() => {
			document.getElementById('articleList')!.style.display = 'none';
			document.getElementById('trackList')!.style.display = 'block';
		}, 150);
	});

	trackItem?.forEach((track, index) => {
		track.addEventListener('click', () => {
			nowPlaying.forEach((tag) => {
				tag.classList.remove('unhide');
			});

			nowPlaying[index].classList.add('unhide');
		});
	});

	time.forEach((timeItem, index) => {
		const calcTime =
			Math.floor(Tracks[index].duration) -
			Math.floor(Tracks[index].currentTime);

		timeItem.textContent = formatSecondsAsTime(calcTime);
	});

	setInterval(() => {
		Tracks.forEach((track, index) => {
			const calcTime =
				Math.floor(track.duration) - Math.floor(track.currentTime);

			time[index].textContent = formatSecondsAsTime(calcTime);
		});
	}, 500);
}

function str_pad_left(string: string, pad: string, length: number) {
	return (new Array(length + 1).join(pad) + string).slice(-length);
}

function formatSecondsAsTime(time: number) {
	const minutes = Math.floor(time / 60);
	const minuteString = minutes.toString();

	const sec = time - minutes * 60;
	const secString = sec.toLocaleString();

	return (
		str_pad_left(minuteString, '0', 2) + ':' + str_pad_left(secString, '0', 2)
	);
}

renderHtml();
