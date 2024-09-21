export const manifestInstructions = [
    {
        title: "ALLOCATE_GLOBAL_ADDRESS",
        replaceWith: null
    },
    {
        title: "ASSERT_WORKTOP_CONTAINS",
        replaceWith: `ASSERT_WORKTOP_CONTAINS
    Address("RESOURCE_ADDRESS")
    Decimal("AMOUNT");`
    },
    {
        title: "ASSERT_WORKTOP_CONTAINS_ANY",
        replaceWith: `ASSERT_WORKTOP_CONTAINS_ANY
    Address("RESOURCE_ADDRESS");`
    },
    {
        title: "ASSERT_WORKTOP_CONTAINS_NON_FUNGIBLES",
        replaceWith: `ASSERT_WORKTOP_CONTAINS_NON_FUNGIBLES
    Address("RESOURCE_ADDRESS")
    Array<NonFungibleLocalId>(NonFungibleLocalId("ID1"));`
    },
    {
        title: "BURN_RESOURCE",
        replaceWith: `BURN_RESOURCE
    Bucket("BUCKET_NAME");`
    },
    {
        title: "CALL_FUNCTION",
        replaceWith: `CALL_FUNCTION Address("") "BLUEPRINT_NAME" "FUNCTION_NAME";`
    },
    {
        title: "CALL_METHOD",
        replaceWith: `CALL_METHOD Address("") "METHOD_NAME";`
    },
    {
        title: "CLAIM_COMPONENT_ROYALTIES",
        replaceWith: `CLAIM_COMPONENT_ROYALTIES
    Address("COMPONENT_ADDRESS");`
    },
    {
        title: "CLAIM_PACKAGE_ROYALTIES",
        replaceWith: `CLAIM_PACKAGE_ROYALTIES
    Address("PACKAGE_ADDRESS");`
    },
    {
        title: "CLONE_PROOF",
        replaceWith: `CLONE_PROOF
    Proof("proof")
    Proof("cloned_proof");`
    },
    {
        title: "CREATE_ACCESS_CONTROLLER",
        replaceWith: `CREATE_ACCESS_CONTROLLER
    Bucket("BUCKET_NAME")
    Tuple(
        Enum<1u8>(), # primary role
        Enum<1u8>(), # recovery role
        Enum<1u8>()  # confirmation role
    )
    None # timed recovery delay in minutes
    None; # address reservation`
    },
    {
        title: "CREATE_ACCOUNT",
        replaceWith: null
    },
    {
        title: "CREATE_ACCOUNT_ADVANCED",
        replaceWith: null
    },
    {
        title: "CREATE_FUNGIBLE_RESOURCE",
        replaceWith: `CREATE_FUNGIBLE_RESOURCE
    # Owner role - This gets metadata permissions, and is the default for other permissions
    # Can set as Enum<OwnerRole::Fixed>(access_rule)  or Enum<OwnerRole::Updatable>(access_rule)
    Enum<OwnerRole::None>()
    true             # Whether the engine should track supply (avoid for massively parallelizable tokens)
    18u8             # Divisibility (between 0u8 and 18u8)
    Tuple(
        Some(         # Mint Roles (if None: defaults to DenyAll, DenyAll)
            Tuple(
                Some(Enum<AccessRule::AllowAll>()),  # Minter (if None: defaults to Owner)
                Some(Enum<AccessRule::DenyAll>())    # Minter Updater (if None: defaults to Owner)
            )
        ),
        None,        # Burn Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Freeze Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Recall Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Withdraw Roles (if None: defaults to AllowAll, DenyAll)
        None         # Deposit Roles (if None: defaults to AllowAll, DenyAll)
    )
    Tuple(                                                                   # Metadata initialization
        Map<String, Tuple>(                                                  # Initial metadata values
            "name" => Tuple(
                Some(Enum<Metadata::String>("MyResource")),                  # Resource Name
                true                                                         # Locked
            )
        ),
        Map<String, Enum>(                                                   # Metadata roles
            "metadata_setter" => Some(Enum<AccessRule::AllowAll>()),         # Metadata setter role
            "metadata_setter_updater" => None,                               # Metadata setter updater role as None defaults to OWNER
            "metadata_locker" => Some(Enum<AccessRule::DenyAll>()),          # Metadata locker role
            "metadata_locker_updater" => None                                # Metadata locker updater role as None defaults to OWNER
        )
    )
    None;                                                                     # No Address Reservation`
    },
    {
        title: "CREATE_FUNGIBLE_RESOURCE_WITH_INITIAL_SUPPLY",
        replaceWith: `CREATE_FUNGIBLE_RESOURCE_WITH_INITIAL_SUPPLY
    # Owner role - This gets metadata permissions, and is the default for other permissions
    # Can set as Enum<OwnerRole::Fixed>(access_rule)  or Enum<OwnerRole::Updatable>(access_rule)
    Enum<OwnerRole::None>()
    true             # Whether the engine should track supply (avoid for massively parallelizable tokens)
    18u8             # Divisibility (between 0u8 and 18u8)
    Decimal("10000") # Initial supply
    Tuple(
        Some(         # Mint Roles (if None: defaults to DenyAll, DenyAll)
            Tuple(
                Some(Enum<AccessRule::AllowAll>()),  # Minter (if None: defaults to Owner)
                Some(Enum<AccessRule::DenyAll>())    # Minter Updater (if None: defaults to Owner)
            )
        ),
        None,        # Burn Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Freeze Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Recall Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Withdraw Roles (if None: defaults to AllowAll, DenyAll)
        None         # Deposit Roles (if None: defaults to AllowAll, DenyAll)
    )
    Tuple(                                                                   # Metadata initialization
        Map<String, Tuple>(                                                  # Initial metadata values
            "name" => Tuple(
                Some(Enum<Metadata::String>("MyResource")),                  # Resource Name
                true                                                         # Locked
            )
        ),
        Map<String, Enum>(                                                   # Metadata roles
            "metadata_setter" => Some(Enum<AccessRule::AllowAll>()),         # Metadata setter role
            "metadata_setter_updater" => None,                               # Metadata setter updater role as None defaults to OWNER
            "metadata_locker" => Some(Enum<AccessRule::DenyAll>()),          # Metadata locker role
            "metadata_locker_updater" => None                                # Metadata locker updater role as None defaults to OWNER
        )
    )
    None;                                                                     # No Address Reservation
`
    },
    {
        title: "CREATE_IDENTITY",
        replaceWith: null
    },
    {
        title: "CREATE_IDENTITY_ADVANCED",
        replaceWith: null
    },
    {
        title: "CREATE_NON_FUNGIBLE_RESOURCE",
        replaceWith: `CREATE_NON_FUNGIBLE_RESOURCE
    # Owner role - This gets metadata permissions, and is the default for other permissions
    # Can set as Enum<OwnerRole::Fixed>(access_rule)  or Enum<OwnerRole::Updatable>(access_rule)
    Enum<OwnerRole::None>()
    Enum<NonFungibleIdType::Integer>()                                                                          # The type of NonFungible Id
    true                                                                                                        # Whether the engine should track supply (avoid for massively parallelizable tokens)
    Enum<0u8>(Enum<0u8>(Tuple(Array<Enum>(), Array<Tuple>(), Array<Enum>())), Enum<0u8>(66u8), Array<String>())     # Non Fungible Data Schema
    Tuple(
        Some(         # Mint Roles (if None: defaults to DenyAll, DenyAll)
            Tuple(
                Some(Enum<AccessRule::AllowAll>()),  # Minter (if None: defaults to Owner)
                Some(Enum<AccessRule::DenyAll>())    # Minter Updater (if None: defaults to Owner)
            )
        ),
        None,        # Burn Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Freeze Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Recall Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Withdraw Roles (if None: defaults to AllowAll, DenyAll)
        None,        # Deposit Roles (if None: defaults to AllowAll, DenyAll)
        None         # Non Fungible Data Update Roles (if None: defaults to DenyAll, DenyAll)
    )
    Tuple(                                                                   # Metadata initialization
        Map<String, Tuple>(                                                  # Initial metadata values
            "name" => Tuple(
                Some(Enum<Metadata::String>("MyResource")),                  # Resource Name
                true                                                         # Locked
            )
        ),
        Map<String, Enum>(                                                   # Metadata roles
            "metadata_setter" => Some(Enum<AccessRule::AllowAll>()),         # Metadata setter role
            "metadata_setter_updater" => None,                               # Metadata setter updater role as None defaults to OWNER
            "metadata_locker" => Some(Enum<AccessRule::DenyAll>()),          # Metadata locker role
            "metadata_locker_updater" => None                                # Metadata locker updater role as None defaults to OWNER
        )
    )
    None;             # No Address Reservation`
    },
    {
        title: "CREATE_NON_FUNGIBLE_RESOURCE_WITH_INITIAL_SUPPLY",
        replaceWith: `CREATE_NON_FUNGIBLE_RESOURCE_WITH_INITIAL_SUPPLY
    # Owner role - This gets metadata permissions, and is the default for other permissions
    # Can set as Enum<OwnerRole::Fixed>(access_rule)  or Enum<OwnerRole::Updatable>(access_rule)
    Enum<OwnerRole::None>()
    Enum<NonFungibleIdType::Integer>()                                                                  # The type of NonFungible Id
    true                                                                                                # Whether the engine should track supply (avoid for massively parallelizable tokens)
    Enum<0u8>(Enum<0u8>(Tuple(Array<Enum>(), Array<Tuple>(), Array<Enum>())), Enum<0u8>(66u8), Array<String>())     # Non Fungible Data Schema
    Map<NonFungibleLocalId, Tuple>(                                                                     # Initial supply to mint
        NonFungibleLocalId("#1#") => Tuple(Tuple())
    )
    Tuple(
        Some(         # Mint Roles (if None: defaults to DenyAll, DenyAll)
            Tuple(
                Some(Enum<AccessRule::AllowAll>()),  # Minter (if None: defaults to Owner)
                Some(Enum<AccessRule::DenyAll>())    # Minter Updater (if None: defaults to Owner)
            )
        ),
        None,        # Burn Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Freeze Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Recall Roles (if None: defaults to DenyAll, DenyAll)
        None,        # Withdraw Roles (if None: defaults to AllowAll, DenyAll)
        None,        # Deposit Roles (if None: defaults to AllowAll, DenyAll)
        None         # Non Fungible Data Update Roles (if None: defaults to DenyAll, DenyAll)
    )
    Tuple(                                                                   # Metadata initialization
        Map<String, Tuple>(                                                  # Initial metadata values
            "name" => Tuple(
                Some(Enum<Metadata::String>("MyResource")),                  # Resource Name
                true                                                         # Locked
            )
        ),
        Map<String, Enum>(                                                   # Metadata roles
            "metadata_setter" => Some(Enum<AccessRule::AllowAll>()),         # Metadata setter role
            "metadata_setter_updater" => None,                               # Metadata setter updater role as None defaults to OWNER
            "metadata_locker" => Some(Enum<AccessRule::DenyAll>()),          # Metadata locker role
            "metadata_locker_updater" => None                                # Metadata locker updater role as None defaults to OWNER
        )
    )
    None;                                                                     # No Address Reservation
`
    },
    {
        title: "CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL",
        replaceWith: `CREATE_PROOF_FROM_AUTH_ZONE_OF_ALL
    Address("RESOURCE_ADDRESS")
    Proof("proof");`
    },
    {
        title: "CREATE_PROOF_FROM_AUTH_ZONE_OF_AMOUNT",
        replaceWith: `CREATE_PROOF_FROM_AUTH_ZONE_OF_AMOUNT
    Address("RESOURCE_ADDRESS")
    Decimal("1.0")
    Proof("proof");`
    },
    {
        title: "CREATE_PROOF_FROM_AUTH_ZONE_OF_NON_FUNGIBLES",
        replaceWith: `CREATE_PROOF_FROM_AUTH_ZONE_OF_NON_FUNGIBLES
    Address("RESOURCE_ADDRESS")
    Array<NonFungibleLocalId>(NonFungibleLocalId("#123#"))
    Proof("proof");`
    },
    {
        title: "CREATE_PROOF_FROM_BUCKET_OF_ALL",
        replaceWith: `CREATE_PROOF_FROM_BUCKET_OF_ALL
    Bucket("BUCKET")
    Proof("proof");`
    },
    {
        title: "CREATE_PROOF_FROM_BUCKET_OF_AMOUNT",
        replaceWith: `CREATE_PROOF_FROM_BUCKET_OF_AMOUNT
    Bucket("BUCKET")
    Decimal("1.0")
    Proof("proof");`
    },
    {
        title: "CREATE_PROOF_FROM_BUCKET_OF_NON_FUNGIBLES",
        replaceWith: `CREATE_PROOF_FROM_BUCKET_OF_NON_FUNGIBLES
    Bucket("BUCKET")
    Array<NonFungibleLocalId>(NonFungibleLocalId("#123#"))
    Proof("proof1b");`
    },
    {
        title: "DROP_AUTH_ZONE_PROOFS",
        replaceWith: `DROP_AUTH_ZONE_PROOFS;`
    },
    {
        title: "DROP_ALL_PROOFS",
        replaceWith: `DROP_ALL_PROOFS;`
    },
    {
        title: "DROP_AUTH_ZONE_REGULAR_PROOFS",
        replaceWith: `DROP_AUTH_ZONE_REGULAR_PROOFS;`
    },
    {
        title: "DROP_AUTH_ZONE_SIGNATURE_PROOFS",
        replaceWith: `DROP_AUTH_ZONE_SIGNATURE_PROOFS;`
    },
    {
        title: "DROP_NAMED_PROOFS",
        replaceWith: `DROP_NAMED_PROOFS;`
    },
    {
        title: "FREEZE_VAULT",
        replaceWith: `FREEZE_VAULT
    Address("internal_vault_sim1tpv9skzctpv9skzctpv9skzctpv9skzctpv9skzctpv9skzcuxymgh")
    Tuple(1u32); # 1 = freeze withdraws, 2 = freeze deposits, 4 = freeze burn, 7 = freeze all`
    },
    {
        title: "LOCK_COMPONENT_ROYALTY",
        replaceWith: `LOCK_COMPONENT_ROYALTY
    Address("COMPONENT_ADDRESS")
    "my_method";`
    },
    {
        title: "LOCK_METADATA",
        replaceWith: `LOCK_METADATA
    Address("ADDRESS")
    "field_name";`
    },
    {
        title: "LOCK_OWNER_ROLE",
        replaceWith: `LOCK_OWNER_ROLE
    Address("ADDRESS");`
    },
    {
        title: "MINT_FUNGIBLE",
        replaceWith: `MINT_FUNGIBLE
    Address("RESOURCE_ADDRESS")
    Decimal("1.0");`
    },
    {
        title: "MINT_NON_FUNGIBLE",
        replaceWith: `MINT_NON_FUNGIBLE
    Address("resource_sim1n2q4le7dpzucmpnksxj5ku28r3t776pgk879cahgm76c2kfpz48fpj")
    Map<NonFungibleLocalId, Tuple>(
        NonFungibleLocalId("<test_string_id>") => Tuple(
            Tuple(
                "Hello",
                "World",
                Decimal("12"),
            )
        )
    );`
    },
    {
        title: "MINT_RUID_NON_FUNGIBLE",
        replaceWith: `MINT_RUID_NON_FUNGIBLE
    Address("RESOURCE_ADDRESS")
    Array<Tuple>(
        Tuple(Tuple("Hello World", Decimal("12")))
    );`
    },
    {
        title: "POP_FROM_AUTH_ZONE",
        replaceWith: `POP_FROM_AUTH_ZONE
    Proof("proof");`
    },
    {
        title: "PUBLISH_PACKAGE_ADVANCED",
        replaceWith: null
    },
    {
        title: "PUSH_TO_AUTH_ZONE",
        replaceWith: `PUSH_TO_AUTH_ZONE
    Proof("proof");`
    },
    {
        title: "RECALL_FROM_VAULT",
        replaceWith: `RECALL_FROM_VAULT
    Address("INTERNAL_VAULT_ADDRESS")
    Decimal("1.2");`
    },
    {
        title: "RECALL_NON_FUNGIBLES_FROM_VAULT",
        replaceWith: `RECALL_NON_FUNGIBLES_FROM_VAULT
    Address("INTERNAL_VAULT_ADDRESS")
    Array<NonFungibleLocalId>(NonFungibleLocalId("#123#"), NonFungibleLocalId("#456#"));`
    },
    {
        title: "REMOVE_METADATA",
        replaceWith: `REMOVE_METADATA
    Address("ADDRESS")
    "field_name";`
    },
    {
        title: "RETURN_TO_WORKTOP",
        replaceWith: `RETURN_TO_WORKTOP
    Bucket("BUCKET");`
    },
    {
        title: "SET_COMPONENT_ROYALTY",
        replaceWith: `SET_COMPONENT_ROYALTY
    Address("COMPONENT_ADDRESS")
    "my_method"
    Enum<RoyaltyAmount::Free>();`
    },
    {
        title: "SET_METADATA",
        replaceWith: `SET_METADATA
    Address("ADDRESS")
    "field_name"
    Enum<Metadata::String>(
        "Metadata string value, eg description"
    );
`
    },
    {
        title: "SET_OWNER_ROLE",
        replaceWith: `SET_OWNER_ROLE
    Address("ADDRESS")
    Enum<AccessRule::Protected>(
        Enum<AccessRuleNode::ProofRule>(
            Enum<ProofRule::Require>(
                Enum<ResourceOrNonFungible::NonFungible>(
                    NonFungibleGlobalId("RESOURCE_ADDRESS:#123#")
                )
            )
        )
    );`
    },
    {
        title: "SET_ROLE",
        replaceWith: `SET_ROLE
    Address("ADDRESS")
    Enum<ModuleId::Main>() # Main, Metadata, Royalty or RoleAssignment.
    "role_name"
    Enum<AccessRule::Protected>(
        Enum<AccessRuleNode::ProofRule>(
            Enum<ProofRule::Require>(
                Enum<ResourceOrNonFungible::NonFungible>(
                    NonFungibleGlobalId("RESOURCE_ADDRESS:#123#")
                )
            )
        )
    );`
    },
    {
        title: "TAKE_ALL_FROM_WORKTOP",
        replaceWith: `TAKE_ALL_FROM_WORKTOP
    Address("RESOURCE_ADDRESS")
    Bucket("BUCKET");`
    },
    {
        title: "TAKE_FROM_WORKTOP",
        replaceWith: `TAKE_FROM_WORKTOP
    Address("RESOURCE_ADDRESS")
    Decimal("1.0")
    Bucket("BUCKET");`
    },
    {
        title: "TAKE_NON_FUNGIBLES_FROM_WORKTOP",
        replaceWith: `TAKE_NON_FUNGIBLES_FROM_WORKTOP
    Address("RESOURCE_ADDRESS")
    Array<NonFungibleLocalId>(NonFungibleLocalId("#1#"), NonFungibleLocalId("#2#"))
    Bucket("BUCKET");`
    },
    {
        title: "UNFREEZE_VAULT",
        replaceWith: `UNFREEZE_VAULT
    Address("INTERNAL_VAULT_ADDRESS")
    Tuple(1u32); # 1 = unfreeze withdraws, 2 = unfreeze deposits, 4 = unfreeze burns, 7 = unfreeze all`
    },
]

export const manifestObjects = [
    {
        title: "Bucket",
        replaceWith: `Bucket("")`
    },
    {
        title: "Array",
        replaceWith: null
    },
    {
        title: "Map",
        replaceWith: null
    },
    {
        title: "Address",
        replaceWith: null
    },
    {
        title: "Tuple",
        replaceWith: null
    },
    {
        title: "Enum",
        replaceWith: null
    },
    {
        title: "Decimal",
        replaceWith: null
    },
    {
        title: "NonFungibleLocalId",
        replaceWith: null
    },
    {
        title: "NonFungibleGlobalId",
        replaceWith: null
    }
]

export const manifestEnumFields = [
    "OwnerRole::Fixed",
    "AccessRule::Protected",
    "AccessRule::AllowAll",
    "AccessRule::DenyAll",
    "AccessRuleNode::ProofRule",
    "ProofRule::Require",
    "ResourceOrNonFungible::NonFungible",
    "Metadata::String",
    "Metadata::Bool",
    "Metadata::U8",
    "Metadata::U32",
    "Metadata::U64",
    "Metadata::I32",
    "Metadata::I64",
    "Metadata::Decimal",
    "Metadata::Address",
    "Metadata::PublicKey",
    "Metadata::NonFungibleGlobalId",
    "Metadata::NonFungibleLocalId",
    "Metadata::Instant",
    "Metadata::Url",
    "Metadata::Origin",
    "Metadata::PublicKeyHash",
    "Metadata::StringArray"
]