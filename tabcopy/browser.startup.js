
LOOKUP_GUID = "lookupguid?name="
READ_IP_GIVEN_GUID = "read?field=ip&guid="
GNS_DOMAIN_NAME = "opengns.com"


HTTP_HEAD = "http://"
GOOGLE_HEAD = "https://www.google.com/search?q="
GNS_HEAD = "http://www."+ GNS_DOMAIN_NAME +"/?q="

READ_GUID_ERROR = "unable to get guid";
READ_IP_ERROR = "unable to read ip value";
HTTP_ERROR = "http error while making request";
JQUERY_READY = "jquery is loaded";

GPSERVER = "http://gpserver."+ GNS_DOMAIN_NAME +":24703/GNS/lookupguid?name="
TIMEOUT_MS = 3000


var tld_tail = "."+ GNS_DOMAIN_NAME +"."
var special_character_list = [ "-" , "~", "`", "!", "@" , "#", "$", "%", "^", "&", "*", "(", ")", "_", "+",
                                 "=", "{", "}", "[", "]", "|",  "\\", ":", ";", "\"", "'", "<", ">", " ",
                                  ",", ".",  "?", "/", " "];
var encoded_character = {};

encoded_character['~'] = "-x"
encoded_character['`'] = "-c"

encoded_character[' '] = "--"

encoded_character['!'] = "-1"
encoded_character['@'] = "-2"
encoded_character['#'] = "-3"
encoded_character['$'] = "-4"
encoded_character['%'] = "-5"
encoded_character['^'] = "-6"
encoded_character['&'] = "-7"
encoded_character['*'] = "-8"
encoded_character['('] = "-9"
encoded_character[')'] = "-0"
encoded_character['.'] = "-k"

encoded_character['_'] = "-q"
encoded_character['-'] = "-w"
encoded_character['+'] = "-e"
encoded_character['='] = "-r"
encoded_character['{'] = "-t"
encoded_character['}'] = "-y"

encoded_character['['] = "-u"
encoded_character[']'] = "-i"
encoded_character['|'] = "-o"
encoded_character['\\'] = "-p"

encoded_character[':'] = "-a"
encoded_character[';'] = "-s"
encoded_character['"'] = "-d"
encoded_character['\''] = "-f"

encoded_character['<'] = "-g"
encoded_character['>'] = "-h"
encoded_character[','] = "-j"
encoded_character['.'] = "-k"
encoded_character['?'] = "-l"
encoded_character['/'] = "-z"

encoded_character['START'] = "0-v"


// Helper function to get dns formatted name from an arbitrary string
function get_dns_formatted_domain_name(input){
    // replace special characters with encoded characters
    for (i = 0 ; i < special_character_list.length; i++){
        if (input.indexOf(special_character_list[i]) > -1) {
            // get regular expression for the character

            formatted_character = '\\' + special_character_list[i] 
            var regex = new RegExp(formatted_character, 'g');
            input = input.replace(regex, encoded_character[ special_character_list[i] ] );
        }

    }

    //replace the starting hyphen (if present) with start marker
    if (input[0] == '-'){
        input = encoded_character['START'] + input;
    }

    //add tld_tail
    input = input + tld_tail

    return input;
}


function get_encoded_url(search_string) {
    string_with_plus = make_string_with_plus(search_string); 
    final_redirect_url = GOOGLE_HEAD + string_with_plus;

    search_string = search_string.trim();
    lookup_url = GPSERVER +  get_dns_formatted_domain_name(search_string)
    redirection_url = HTTP_HEAD +  get_dns_formatted_domain_name(search_string)

    console.log(lookup_url);
    console.log(redirection_url);

    jQuery.ajax({
        url: lookup_url,
        async: false,
        success: function (result) {
            if( result.includes("+NO+") || result.includes("+GENERICERROR+") || result.includes("ACTIVE_REPLICA_EXCEPTION") ) 
                console.log("No domain exists with that name")

            else{
                console.log("domain exists with that name");
                final_redirect_url = redirection_url;
            }
        },
        error: function (result) {
            console.log(HTTP_ERROR);
        }
    });

    return final_redirect_url;
} 

function make_dotted_string(str) {
    return str.replace("+", " ");
}


function make_string_with_plus(str) {
    return str.replace(" ", "+");
}

function check_error_in_result(result) {
    if( result.includes("+NO+") || result.includes("+GENERICERROR+") || result.includes("+ACCESS_DENIED+") ) 
        return true;
    else
        return false;
}

// Add listener to intercept urls starting www.opengns.com/
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    //console.log(details.url);
    if (details.url.startsWith(GNS_HEAD)) {

        debugger;
        initial_url = details.url;
        if(initial_url.indexOf('+') >  -1) {
            var regex = new RegExp('\\+', 'g');
            initial_url = initial_url.replace(regex, ' ');
        }

        url_string = decodeURIComponent(initial_url);
        total_String = url_string.split(GNS_HEAD);
        search_string = total_String[1];

        final_redirect_url = "";
        if (jQuery) {

            console.log(JQUERY_READY);
            final_redirect_url = get_encoded_url(search_string);
        }

        return { redirectUrl: final_redirect_url };
    }

}, {
        urls: ["*://www."+ GNS_DOMAIN_NAME +"/*"], 
        types: ['main_frame', 'sub_frame'],
    }, ['blocking']);




