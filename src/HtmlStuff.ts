function renderHtml() {
	const tabs = document.querySelector('.line_wrapper');
	const line = document.querySelector('.line');
	const aboutBtn = document.querySelector('#About');
	const trackBtn = document.querySelector('#Track');
	const trackList = document.querySelector('.musicList');
	const articleList = document.querySelector('.articleList');

	const nowPlaying = document.querySelectorAll('.nowPlaying');
	const trackItem = document.querySelectorAll('.trackItem');
	const Tracks = document.querySelectorAll('audio');

	const track1 = Tracks[0];

	console.log(track1.duration);

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
}

// not working yet
function formatSecondsAsTime(secs: number) {
	let hr = Math.floor(secs / 3600);
	let min = Math.floor((secs - hr * 3600) / 60);
	let sec = Math.floor(secs - hr * 3600 - min * 60);

	if (min < 10) {
		min = '0' + min;
	}
	if (sec < 10) {
		sec = '0' + sec;
	}

	return min + ':' + sec;
}

renderHtml();
