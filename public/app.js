// tabs

const tabs = (
    headerSelector,
    tabSelector,
    contentSelector,
    activeClass,
    display = 'block'
) => {
    try {
        const header = document.querySelector(headerSelector)
        const tab = document.querySelectorAll(tabSelector)
        const content = document.querySelectorAll(contentSelector)
    
        function hideTabContent() {
            content.forEach((item) => {
                item.style.display = 'none'
            })

            tab.forEach((item) => {
                item.classList.remove(activeClass)
            })
        }

        function showTabContent(i = 0) {
            content[i].style.display = display
            tab[i].classList.add(activeClass)
        }

        hideTabContent()
        showTabContent(1)
        showTabContent(0)

        header.addEventListener('click', (e) => {
            const target = e.target
            if (
                target &&
                (target.classList.contains(tabSelector.replace(/\./, '')) ||
                    target.parentNode.classList.contains(tabSelector.replace(/\./, '')))
            ) {
                tab.forEach((item, idx) => {
                    if (target == item || target.parentNode == item) {
                        hideTabContent()
                        showTabContent(idx)
                    }
                })
            }
        })
    } catch (error) {
        console.log(error)
    }
}

tabs('.tabs', '.tab', '.contentSelector', 'active', 'inline-block')



// menu
try {
    const iconMenu = document.querySelector('.icon-menu')
    const menuBody = document.querySelector('.menu-body')
    const shadow = document.querySelector('.shadow')
    let boolMenu = false
    const listLink = document.querySelectorAll('.list-link')

    iconMenu.addEventListener('click', function() {
        if (boolMenu === false) {
            addClass()
        } else if (boolMenu === true) {
            removeClass()
        }
    })
    shadow.addEventListener('click', function() {
        if (boolMenu === false) {
            addClass()
        } else if (boolMenu === true) {
            removeClass()
        }
    })

    const escapeHandler = (event) => {
        let keyCode = event.keyCode
        if (event.code === 'Escape' || keyCode === 27 || keyCode === '27') {
            removeClass()
        }
    }

    const addClass = () => {
        iconMenu.classList.add('active')
        menuBody.classList.add('active')
        shadow.classList.add('active')

        listLink.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('active')
            }, 100 * i)
        })

        boolMenu = true
        iconMenu.disabled = true
        setTimeout(() => {
            iconMenu.disabled = false
        }, 400)
        document.addEventListener('keydown', escapeHandler)
    }
    const removeClass = () => {
        iconMenu.classList.remove('active')
        menuBody.classList.remove('active')
        shadow.classList.remove('active')

        listLink.forEach((item, i) => {
            setTimeout(() => {
                item.classList.remove('active')
            }, 400)
        })

        boolMenu = false
        iconMenu.disabled = true
        setTimeout(() => {
            iconMenu.disabled = false
        }, 400)
        document.removeEventListener('keydown', escapeHandler)
    }
} catch (error) {
    console.log()
}

//  other
try {
    const toCurrency = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            currency: 'rub',
            style: 'currency',
        }).format(price)
    }

    const toDate = (date) => {
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date(date))
    }

    document.querySelectorAll('.price').forEach((node) => {
        node.textContent = toCurrency(node.textContent)
    })

    document.querySelectorAll('.date').forEach((node) => {
        node.textContent = toDate(node.textContent)
    })

    const $card = document.querySelector('#card')
    if ($card) {
        $card.addEventListener('click', (event) => {
            if (event.target.classList.contains('js-remove')) {
                const id = event.target.dataset.id
                const csrf = event.target.dataset.csrf

                fetch('/card/remove/' + id, {
                        method: 'delete',
                        headers: {
                            'X-XSRF-TOKEN': csrf,
                        },
                    })
                    .then((res) => res.json())
                    .then((card) => {
                        if (card.courses.length) {
                            const html = card.courses
                                .map((c) => {
                                    return `
                  <tr>
                    <td>${c.title}</td>
                    <td>${c.count}</td>
                    <td>
                      <button class="btn btm-small js-remove" data-id="${c.id}" data-csrf="${csrf}">Удалить</button>
                    </td>
                  </tr>
                  `
                                })
                                .join('')
                            $card.querySelector('tbody').innerHTML = html
                            $card.querySelector('.price').textContent = toCurrency(card.price)
                        } else {
                            $card.innerHTML = '<p>Корзина пуста</p>'
                        }
                    })
            }
        })
    }
} catch (error) {
    console.log(error)
}

try {
    M.Tabs.init(document.querySelectorAll('.tabs'))
} catch (error) {
    console.log(error)
}