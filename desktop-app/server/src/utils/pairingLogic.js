const generatePairingCode = () => {
    const max = 10000
    const min = 1000

    const generateCode = Math.floor(Math.random() * (max - min) + min)

    return generateCode.toString();
}

export default generatePairingCode