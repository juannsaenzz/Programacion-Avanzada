
//promises
// resolve ejecuta el llamado al promise cuando el mismo llamado es correcto
// reject ejecuta el llamado al promise cuando hay un error

const aplicarDescuento = new Promise((resolve, reject) => {
    setTimeout(() => {
        let descuento =  false;
        if (descuento) {
            resolve('Descuento aplicado');
        } else {
            reject('No se pudo aplicar el descuento');
        }
    }, 3000);       
}       );      

