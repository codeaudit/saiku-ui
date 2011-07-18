var Table = Backbone.View.extend({
    initialize: function(args) {
        this.workspace = args.workspace;
        
        // Bind table rendering to query result event
        _.bindAll(this, "render", "process_data");
        this.workspace.bind('query_result', this.render);
    },
    
    render: function(args) {
        // Clear the contents of the table
        $(this.el).html('');
        $(args.workspace.el).find('.workspace_results')
            .text('Rendering ' + args.data.length + '...');
        
        // Check to see if there is data
        if (args.data.length == 0) {
            return this.no_results(args);
        }
        
        // Check for error
        if (args.data[0][0]['type'] == "ERROR") {
            this.error(args);
        }
        
        // Create table for streaming result
        $table = $('<table />');
        $(this.el).append($table);
        
        // Render the table without blocking the UI thread
        _.delay(this.process_data, 0, args);
    },
    
    process_data: function(args) {
        var contents = "";
        for (var row = 0; row < args.data.length; row++) {
            contents += "<tr>";
            for (var col = 0; col < args.data[row].length; col++) {
                var header = args.data[row][col];
                
                // FIXME - this needs to be cleaned up
                
                // If the cell is a column header and is null (top left of table)
                if (header['type'] === "COLUMN_HEADER" && header['value'] === "null") {
                    contents += '<th class="all_null"><div>&nbsp;</div></th>';
                } // If the cell is a column header and isn't null (column header of table)
                else if (header['type'] === "COLUMN_HEADER") {
                    contents += '<th class="col"><div>' + header['value'] + '</div></th>';
                } // If the cell is a row header and is null (grouped row header)
                else if (header['type'] === "ROW_HEADER" && header['value'] === "null") {
                    contents += '<th class="row_null"><div>&nbsp;</div></th>';
                } // If the cell is a row header and isn't null (last row header)
                else if (header['type'] === "ROW_HEADER") {
                    contents += '<th class="row"><div>' + header['value'] + '</div></th>';
                }
                else if (header['type'] === "ROW_HEADER_HEADER") {
                    contents += '<th class="row_header"><div>' + header['value'] + '</div></th>';
                } // If the cell is a normal data cell
                else if (header['type'] === "DATA_CELL") {
                    contents += '<td class="data"><div>' + header['value'] + '</div></td>';
                }
            }
            contents += "</tr>";
        };
        
        // Append the table
        $(this.el).find('table').html(contents);
        
        // Show in the workspace
        $(args.workspace.el).find('.workspace_results').html('')
            .append($(this.el).find('table'));
    },
    
    no_results: function(args) {
        $(args.workspace.el).find('.workspace_results')
            .html('No results');
    },
    
    error: function(args) {
        $(args.workspace.el).find('.workspace_results')
            .html(args.data[0][0]['value']);
    }
});