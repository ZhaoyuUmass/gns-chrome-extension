
$(document).ready(function(){
        
    function make_url(query) {
        if ( query.indexOf("https://") == -1 & query.indexOf("http://") == -1 )
            return "http://"+query;
    }

    function format_query(query) {

        //replace tabs with space 
        query = query.replace('\t',' ');

        // Replace multiple spaces with single space
        query = query.replace(/ +(?= )/g,'');

        // trim leading and trailing white spaces
        query = query.trim();

        return query;
    }

    function get_list_of_tlds() {
        var tld_list = ["com", "edu", "us", "in", "net"];
        return tld_list;
    }

    function check_name_in_tld(name) {
        tld_list = get_list_of_tlds();
        if (tld_list.includes(name))
            return 1;
        else
            return 0;
    }

    function validate_search_query(query) {

        // if query contains spaces then it is valid gns query
        if (query.indexOf(' ') != -1 ) {
            return 1;
        }

        domain_in_splits = query.split('.');

        if (domain_in_splits.length == 1) {
            // no dotted character hence a valid gns query
            return 1;
        }

        // if top level domain is prsent in list of most common tlds then 
        // it is a valid dns query hence return 0
        top_level_domain = domain_in_splits[domain_in_splits.length - 1]
        if ( check_name_in_tld(top_level_domain) == 1) {
            return 0;
        }
        else
            return 1;
    }

   
    $( "#search-form" ).submit(function( event ) {
        var search_query = $("#input-query").val();
        search_query = format_query(search_query);
        
        var result = validate_search_query(search_query);

        //debugger;
        if(result == 0)
            window.location.href = make_url(search_query);

        else    
            window.location.href = "http://www."+ GNS_DOMAIN_NAME +"/?q=" + search_query;

        event.preventDefault();
    });

});