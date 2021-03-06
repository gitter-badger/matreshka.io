import g from './globals';
import {Matreshka as MK, balalaika as $} from '../matreshka';

export default class extends MK.Array {
	Model = MK.Object;
	itemRenderer = '<li>';
	constructor(data) {
		var UP_KEY = 38,
			DOWN_KEY = 40,
			TAB_KEY = 9,
			ENTER_KEY = 13;

		super()
			.set(data)
			.bindNode({
				sandbox: 'header',
				container: ':sandbox .search-results-dropdown',
				search: ':sandbox .search',
				searchMode: [':sandbox', MK.binders.className('search-mode')]
			})
			.on({
				'click::(.show-search)': evt => {
					this.searchMode = true;
					this.bound('search').focus();
				},
				'click::(.back)': evt => {
					this.searchMode = false;
					this.search = '';
				},
				'*@render': evt => {
					evt.self
						.bindNode('header', ':sandbox', MK.binders.innerHTML())
						.bindNode('isActive', ':sandbox', MK.binders.className('active'));
				},
				'@click::sandbox': evt => {
					this.searchMode = false;
					this.search = '';
					document.location.hash = this.active.id;
				},
				'*@mouseover::sandbox': evt => {
					this.forEach(function(item) {
						item.isActive = item.eq(evt.self);
					});
				},
				'keydown::search': evt => {
					var activeIndex;
					if (this.length) {
						if (evt.which === UP_KEY || evt.which === DOWN_KEY) {
							activeIndex = this.indexOf(this.active);

							if (evt.which === UP_KEY) {
								activeIndex = activeIndex - 1;
							} else if (evt.which === DOWN_KEY) {
								activeIndex = activeIndex + 1;
							}

							activeIndex = activeIndex < 0 ? this.length + activeIndex : activeIndex;
							activeIndex %= this.length;
							this.forEach(function(item, index) {
								item.isActive = index === activeIndex;
							});

							evt.preventDefault();
						} else if (evt.which === ENTER_KEY) {
							document.location.hash = this.active.id;
							this.search = '';
							this.searchMode = false;
						}
					}
				},
				'*@change:isActive': evt => {
					this.active = evt.self.isActive ? evt.self : this.active;
				},
				'change:search': evt => {
					var search = this.search;
					if (search) {
						search = search.toLowerCase();
						this.recreate(g.app.articles
							.toNative()
							.filter(function(article) {
								search.toLowerCase()
								return ~article.name.toLowerCase().indexOf(search) ||
									~article.id.toLowerCase().indexOf(search);
							}).map(function(article) {
								return {
									header: article.header,
									name: article.name,
									article: article,
									id: article.id
								};
							})
							.slice(0, 5));

						if (this.length) {
							this[0].isActive = true;
						}
					} else {
						this.recreate();
					}
				}
			});
	}
}
