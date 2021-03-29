// Override Settings
var bcSfSearchSettings = {
    search: {
        //suggestionMode: 'test',
        //suggestionPosition: 'left'
    }
};

// Customize style of Suggestion box
BCSfFilter.prototype.customizeSuggestion = function(suggestionElement, searchElement, searchBoxId) {
    if (jQ('#search').css('display') == 'block') {
        jQ(suggestionElement).parent().css({
            'position': 'fixed',
        });
        jQ(suggestionElement).css({
            'overflow-y': 'scroll',
            'height': '300px'
        });
    }
};
// Build header of Search result
BCSfFilter.prototype.buildSearchResultHeader = function(data) {
    var searchTerm = this.escape(this.getSearchTerm());
    if (searchTerm !== null && searchTerm != '')  {
        var content = data.total_product > 0 ? this.getSettingValue('label.search.resultHeader') : this.getSettingValue('label.search.resultEmpty');
    } else {
        var content = this.getSettingValue('label.search.generalTitle');
    }
    jQ('.' + this.class.searchResultHeader).html(content.replace(/{{ terms }}/g, searchTerm));
};
// Build number of Search result
BCSfFilter.prototype.buildSearchResultNumber = function(data) {
    var content = '';
    var searchTerm = this.escape(this.getSearchTerm());
    if (searchTerm !== null && searchTerm != '')  {
        content = this.getSettingValue('label.search.resultNumber');
        content = content.replace(/{{ count }}/g, '<strong>' + data.total_product + '</strong>').replace(/{{ terms }}/g, '<strong>' + searchTerm + '</strong>');
    }
    jQ('.' + this.class.searchResultNumber).html(content);
};
  // Prepare Params of Suggestion API
BCSfFilter.prototype.prepareSuggestionParams = function () {
    var params = {};
    params.shop = this.shopDomain;
    params.t = new Date().getTime();
    if (!this.getSettingValue('search.enableDefaultResult')) params.enable_default_result = false;
    if (!this.getSettingValue('search.enableFuzzy')) params.fuzzy = false;
    // Skip fields
    var skipFields = this.getSettingValue('search.skipFields');
    if (skipFields.length > 0) {
        param.skipFields = skipFields;
    }
    params.callback = 'BCSfSuggestionCallback';
    return params;
};
// Fix XSS
BCSfFilter.prototype.customizeSearchTerm = function (searchTerm) {
   return encodeURIParamValue(searchTerm.trim());
};
function BCSfSuggestionCallback(result) {
    suggestionCallback(jQ.map(result, function (item, index) {
        return { key: index, values: item };
    }));
};
// Build Suggestion
BCSfFilter.prototype.buildSuggestion = function(searchTerm, data, ul) {
      searchTerm = this.escape(searchTerm);
    var result = '';
    var blocks = this.getSettingValue('search.suggestionBlocks');
    for (var k = 0; k < blocks.length; k++) {
        var index = this.findIndexArray(blocks[k], data, 'key');
        if (index > -1 && data[index].hasOwnProperty('values') && data[index]['values'].length > 0) {
            switch(blocks[k]) {
                case 'suggestions': result += this.buildSuggestionPopular(searchTerm, data[index]['values'], ul); break;
                case 'products': result += this.buildSuggestionProductList(searchTerm, data[index]['values'], ul); break;
                case 'did_you_mean': result += this.buildSuggestionDidYouMeanList(searchTerm, data[index]['values'], ul); break;
            }
        }
    }
    if (result != '') {
        result += this.buildSuggestionViewAll(searchTerm, data, ul);
    }
    jQ(ul).append(result);

    // Wrapper
    this.buildSuggestionWrapper(ul);
};
// Highlight Text in the Search result
BCSfFilter.prototype.highlightSuggestionResult = function(resultItem, searchTerm) {
    if (this.getSettingValue('search.highlightSuggestionResult') && searchTerm.length > 1) {
        // Find words that are the same with the Search term
        var termElements = searchTerm.split(' ');
        for (var i = 0; i < termElements.length; i++) {
            // Escape the following characters: ( ) { } and .
            var reg = new RegExp(termElements[i].replace(/([(){}.])/g, '\$&'), 'ig');
            var foundWords = resultItem.match(reg);
            if (foundWords !== null && foundWords.length > 0) {
                // Remove duplicate values
                foundWords = foundWords.filter(function(item, pos) {
                    return foundWords.indexOf(item) == pos && item != '';
                })
                // Highlight the above words
                for (var k in foundWords) {
                    if (foundWords[k].length > 1) {
                        var reg = new RegExp(foundWords[k], 'g');
                        resultItem = resultItem.replace(reg, '<b>' + foundWords[k] + '</b>');
                    }
                }
            }
        }
    }
    return resultItem;
};
BCSfFilter.prototype.getSearchTerm = function() {
    return getParam(this.searchTermKey);
};

/* Start Search Redirect */
function submitSearchFormMobile(t,e){e.preventDefault();var o=bcsffilter.getSearchRedirectUrl(bcsffilter.currentTerm);o?window.location.href=o:jQ(t).closest("form").submit()}function beforeSubmitSearchForm(t,e){var o=jQ(t).val(),i=bcsffilter.getSearchRedirectUrl(o);i&&(e.stopImmediatePropagation(),e.stopPropagation(),e.preventDefault(),window.location.href=i)}BCSfFilter.prototype.setSuggestionPosition=function(t){var e=this;if("function"==typeof getSuggestionPosition&&"function"==typeof this.checkIsFullWidthSuggestionMobile){var o=getSuggestionPosition(t),i=this.checkIsFullWidthSuggestionMobile(t)?"top":"top+12";"function"!=typeof e.isSuggestionStyle2||e.isSuggestionStyle2(),"left"==o?jQ(t).autocomplete("option","position",{my:"left "+i,at:"left bottom",collision:"none"}):jQ(t).autocomplete("option","position",{my:"right "+i,at:"right bottom",collision:"none"})}else"left"==this.getSettingValue("search.suggestionPosition")?jQ(t).autocomplete("option","position",{my:"left top+12",at:"left bottom",collision:"none"}):jQ(t).autocomplete("option","position",{my:"right top+12",at:"right bottom",collision:"none"});if(jQ(t).length>0&&jQ(t).on("keydown",function(o){13==o.keyCode&&e.enterSearchBoxEvent(t,o)}),jQ(t).closest("form").length>0){var n=jQ(t).closest("form").find('[type="submit"]');n&&n.length>0&&n.each(function(e,o){o.setAttribute("onclick","beforeSubmitSearchForm('"+t+"', event)")})}},BCSfFilter.prototype.enterSearchBoxEvent=function(t,e){var o=jQ(t).val(),i=this.getSearchRedirectUrl(o);i&&(e.preventDefault(),window.location.href=i)},BCSfFilter.prototype.getSearchRedirectUrl=function(t){if(this.suggestionCache&&this.suggestionCache.hasOwnProperty(t))for(var e=this.suggestionCache[t],o=0;o<e.length;o++)if("redirect"==e[o].key&&e[o].values){var i=e[o].values;return i=(i=i.replace("https://"+bcSfFilterMainConfig.shop.domain,"")).replace("http://"+bcSfFilterMainConfig.shop.domain,"")}return""};
/* End Search Redirect */
