'use strict';

const qs   = require('querystring').parse,
      http = require('https');

const access_token = qs(window.location.search.substr(1)).access_token;

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#access_token').innerText = access_token;

    const $response = document.querySelector('#response');

    http.get(`https://api.vk.com/method/users.get?access_token=${access_token}`,
        function (response) {
            response.setEncoding('utf8');

            let buffer = '';

            response.on('data', chunk => buffer += chunk.toString());

            response.on('end', function () {
                try {
                    const data = JSON.parse(buffer);

                    $response.innerText = JSON.stringify(data, null, 1);

                    const user = data.response[ 0 ];

                    document.querySelector('#first_name').innerText = user.first_name;
                    document.querySelector('#last_name').innerText  = user.last_name;

                    document.querySelector('#user').style.display = 'block';
                } catch (e) {
                    $response.innerText = buffer;
                }

                document.querySelector('#api_response').style.display = 'block';
            });
        })
        .on('error', function (e) {
            $response.innerText = 'Error: ' + e.message;
            $response.style.color = 'darkred';

            document.querySelector('#api_response').style.display = 'block';
        });
});
