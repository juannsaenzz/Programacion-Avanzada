
const API_KEY = 'your_api_key_here';

const peticion = fetch(`https://api.example.com/data?api_key=${API_KEY}`);  

peticion
    .then(resp => resp.json())  
    .then(data => {
        const {url} = data.images.original;

        const img = document.createElement('img');
        img.src = url;  
        document.body.append(img);

        console.log(url);  
    })  
    .catch(console.warn);

    // esto se conoce como promesas en cadena

