function renderHtml() {
	const tabs = document.querySelector('.line_wrapper');
	const line = document.querySelector('.line');
	const aboutBtn = document.querySelector('#About');
	const trackBtn = document.querySelector('#Track');
	const trackList = document.querySelector('.musicList');
	const articleList = document.querySelector('.articleList');

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
}

renderHtml();
