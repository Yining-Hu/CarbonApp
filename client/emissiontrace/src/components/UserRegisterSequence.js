export default `
%%{init: {'theme': 'forest', 'themeVariables': { 'fontSize': '20px'}}}%%
    sequenceDiagram
        autonumber
            actor User
            actor Bank
            participant signup/bcacc
            participant signup/
            User->>signup/bcacc: username
            signup/bcacc->>User: new blockchain account and private key
            User->>signup/: username, blockchain account, private key
            signup/->>User: apikey
            Bank->>general/transfer/: receiver's blockchain account, bank's private key, value
`
