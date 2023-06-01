export default `
    sequenceDiagram
        autonumber
            actor User
            participant signup/bcacc
            participant signup
            Note right of signup/bcacc: Generates a new blockchain account and private key and prints them on the console.
            Note right of signup: Generates an apikey and writes it to the user file.
            User->>signup/bcacc: Gets new blockchain credentials.
            User->>signup: Sends username, bcacc, privkey and gets a new apikey.
`
