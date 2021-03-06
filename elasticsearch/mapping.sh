
curl -XPUT 'http://192.168.1.41:9200/voice/_mapping/wit_response' -d '
{
    "wit_response": {
        "properties": {
            "command": {
                "type": "nested",
                "properties": {
                    "entities": {
                        "type": "nested",
                        "properties": {
                            "datetime": {
                                "type": "nested",
                                "properties": {
                                    "grain": {
                                        "type": "string"
                                    },
                                    
                                    "type": {
                                        "type": "string"
                                    },
                                    
                                    "value": {
                                        "type": "date",
                                        "format": "dateOptionalTime"
                                    },
                                    "to":{  
                                        "type": "nested",
                                        "properties": {
                                            "grain": {
                                                "type": "string"
                                            },

                                            "type": {
                                                "type": "string"
                                            },

                                            "value": {
                                                "type": "date",
                                                "format": "dateOptionalTime"
                                            }
                                        }
                                    },
                                    "from":{  
                                        "type": "nested",
                                        "properties": {
                                            "grain": {
                                                "type": "string"
                                            },

                                            "type": {
                                                "type": "string"
                                            },

                                            "value": {
                                                "type": "date",
                                                "format": "dateOptionalTime"
                                            }
                                        }
                                    }
                                    
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
'
