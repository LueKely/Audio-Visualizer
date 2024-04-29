function renderHtml() {
	const tabs = document.querySelector('.line_wrapper');
	const line = document.querySelector('.line');
	const aboutBtn = document.querySelector('#About');
	const trackBtn = document.querySelector('#Track');

	aboutBtn?.addEventListener('click', () => {
		if (line?.classList.contains('.moveRight')) return;
		line?.classList.add('moveRight');
	});

	trackBtn?.addEventListener('click', () => {
		line?.classList.remove('moveRight');
	});
}

renderHtml();
