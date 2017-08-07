# js-namumark
원래 목적은 [php-namumark](https://github.com/koreapyj/php-namumark)를 node.js로 포팅하는 거였으나 만들다 보니 이렇게 됬네요.

## 사용 방법
```js
let Namumark = require('namumark'),
    namumark = new Namumark('doctitle', {
        wiki:{
            read: (title) => 'content' // do something here
        }
        // ... see defaultOptions.js for more options
    });
// you can change renderer by namumark.setRenderer()
namumark.parse((result) => {
    // result object can be diffrerent by renderer.
    let {html, categories} = result;
    console.log('complete!');
    // Do something here
})
```

## 버그
버그가 많습니다. 발코딩이라 그렇습니다. 양해 바랍니다.
기본 HTML 렌더러는 매우 기본적인 기능만 합니다. 이것도 양해 바랍니다.

## 테스트 앱
`node test/app.js`를 하면 테스트용 간단한 위키 앱이 돌아갑니다. 파서 테스트용이니 역사기능은 당연히 없습니다...

## 라이센스
Copyrights (C) 2017 LiteHell

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.