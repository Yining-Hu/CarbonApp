const path = "../build/contracts/Opal.json";
const defaultGas = 400000;

const countOpals = async (contract) => {
    let n = await contract.methods.countToken().call();
    $("#opalcount").html("Opal count: " + n);
};

const mintOpals = (contract, accounts) => {
    let tkname;
    let metadata;

    $("#mintname").on("change", (e) => {
        tkname = e.target.value;
    });
    $("#initialdata").on("change", (e) => {
        metadata = e.target.value;
    });

    $("#mintform").on("submit", async (e) => {
        e.preventDefault();
        await contract.methods
            .mint(tkname,metadata)
            .send({ from: accounts[0], gas: defaultGas });
    });
}

const updateOpals = (contract, accounts) => {
    let tkname;
    let metadata;

    $("#updatename").on("change", (e) => {
        tkname = e.target.value;
    });
    $("#newdata").on("change", (e) => {
        metadata = e.target.value;
    });

    $("#updateform").on("submit", async (e) => {
        e.preventDefault();
        await contract.methods
            .update(tkname,metadata)
            .send({ from: accounts[0], gas: defaultGas });
    });
}

const queryOpals = (contract) => {
    let tkname;
    let metadata;

    $("#queryname").on("change", (e) => {
        tkname = e.target.value;
    });

    $("#queryform").on("submit", async (e) => {
        e.preventDefault();
        metadata = await contract.methods.queryToken(tkname).call();
        $("#queryresult").html("Opal details:" + metadata);
    });
}

const queryOpalsFromDB = () => {
    let tkname;
    let metadata;

    $("#dbqueryname").on("change", (e) => {
        tkname = e.target.value;
    });

    $("#dbqueryform").on("submit", async (e) => {
        e.preventDefault();

        let post_url = $(this).attr("action"); //get form action url
        let form_data = $(this).serialize(); 

        // worked partially
        // $.post(post_url, form_data, function(response) {
        //     alert(response);
        //     metadata = response[0].metadata;
        //     $("#dbqueryresult").html("Opal details:" + metadata);
        // });

        // var posting = $.post( post_url, { id: tkname } );
        // posting.done(function( $data ) {
        //     // metadata = $( data ).find( "#content" );
        //     metadata = $data.metadata;
        //     $( "#dbqueryresult" ).html("Opal details:" + metadata);
        // });

        $.ajax({
            url: post_url,
            type: "post",
            data: form_data ,
            dataType  : 'json',
            success: function (response) {
                alert(response);
                // You will get response from your PHP page (what you echo or print)
            },
            error: function(jqXHR, textStatus, errorThrown) {
               console.log(textStatus, errorThrown);
            }
        });
    });
}

const bulkMint = async (contract, accounts) => {
    let row;
    $('#bmintform').on("submit",function(e){
        e.preventDefault();
        $('#mintfile').parse({
            config: {
                delimiter: "auto",
                header: false,
                complete: function(results) {
                    results.data.map((data,index) => {
                        console.log(data[0]);
                        row = data[0].split(',');
                        contract.methods.mint(row[0],keccak256(row[1]).toString('hex')).send({from: accounts[0], gas: defaultGas});;
                    })
                }
            }
        });
    });
}

const bulkUpdate = async (contract, accounts) => {
    let row;
    $('#bupdateform').on("submit",function(e){
        e.preventDefault();
        $('#updatefile').parse({
            config: {
                delimiter: "auto",
                header: false,
                complete: function(results) {
                    results.data.map((data,index) => {
                        console.log(data[0]);
                        row = data[0].split(',');
                        contract.methods.update(row[0],keccak256(row[1]).toString('hex')).send({from: accounts[0], gas: defaultGas});;
                    })
                }
            }
        });
    });
}

async function opalApp() {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const contract = await getContract(web3, path);

    mintOpals(contract, accounts);
    bulkMint(contract, accounts);
    updateOpals(contract, accounts);
    bulkUpdate(contract, accounts);
    countOpals(contract);
    queryOpals(contract, accounts);
    queryOpalsFromDB();
}

opalApp();