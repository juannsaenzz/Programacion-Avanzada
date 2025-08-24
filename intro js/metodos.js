//metodos de arrays

const personas = [
    {nombre: 'juan', edad: 23, aprendiendo: 'JavaScript'},
    {nombre: 'juan', edad: 21, aprendiendo: 'HTML'}, 
    {nombre: 'pedro', edad: 25, aprendiendo: 'CSS '},
    {nombre: 'maria', edad: 20, aprendiendo: 'Python'},
    {nombre: 'luis', edad: 24, aprendiendo: 'React'},
]

console.log(personas);

// funcion para filtrar mayores de 22 años

const mayores = personas.filter(persona => persona.edad > 22);
console.log(mayores);   

const juanes = personas.filter(persona => persona.nombre === 'juan');
console.log(juanes);


