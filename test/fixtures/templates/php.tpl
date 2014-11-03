<?php

class MyDict
{
  public static $myDict = array(
<% _.forEach(files, function(file) { %>
    "<%= file.originalPath %>" => "<%= file.versionedPath %>",
<% }); %>
  );
}
