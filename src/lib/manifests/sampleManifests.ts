export const sampleManifests = [
`CALL_METHOD
    Address("\${my_account}")
    "withdraw"
    Address("\${XRD}")
    Decimal("100");

CALL_METHOD
    Address("\${my_account}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");`,


    `CALL_FUNCTION 
    Address("$package")
    "TokenCreation"
    "create_simple_fungible"
    Tuple( # Metadata
        Some("Simple1"),
        Some("S2"),
        Some("http://website.com"),
        Some("http://website.com/icon.jpg"),
        Some("My Description"),
        None, # Twitter URL
        Some("http://telegram.com/group"),
        None, # Discord URL
        Array<String>("tag1", "tag2")
    )
    Decimal("0"); # Initial Supply`
]