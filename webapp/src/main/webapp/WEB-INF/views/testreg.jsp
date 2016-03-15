<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="security" uri="http://www.springframework.org/security/tags" %>
<%@ page session="false"%>

<!doctype html>
<html ng-app="tar" id="ng-app">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>Administration and Registration Tools - Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <script type="text/javascript">
        var contextPath = "${pageContext.request.contextPath}";
    </script>   
    <jsp:include page="${includePath}/testreg-css-includes.jsp"></jsp:include>
    <jsp:include page="${includePath}/testadmin-css-includes.jsp"></jsp:include>
    <script src="${baseUrl}resources/js/nothing.js"></script>
</head>
  
<body>
    <input type="hidden" id="baseUrl" value="${baseUrl}" />
       <div class="container" >
       <a id="skipNavigation" class="skipToContent" data-ng-click="#mainContent" href="#mainContent" target="_self">Skip to Main Content</a>
          <div class="header">
            <div class="info"  data-ng-controller="TenantUserController">
                <ul >
                    <security:authorize access="hasRole('ROLE_Client Administrator')">                
	                     <li id="systemsDropdown"><span class="icon_sprite icon_setup2" ></span>Settings
	                        <ul data-ng-controller="HomeController">
	                            <li class="submenu" data-ng-click="go('/clientconfig')" tabindex="0">Client Configuration</li>
	                            <li class="submenu" data-ng-click="go('/searchSubject')" tabindex="0">Manage Subjects</li>
	                        </ul>
	                     </li>  
                     </security:authorize>
                     <li id="systemsDropdown">Resources
                        <ul data-ng-controller="HomeController">
                            <li class="submenu" data-ng-click="go('/downloadTemplate')" tabindex="0">Download Templates</li>
                            <li class="submenu" data-ng-click="openUserGuide('${userguideLocation}')" tabindex="0">User Guide</li>
                        </ul>
                     </li>                                                          
                     <li>Logged in as: 
                         ${user}
                     </li>
                     <li>Tenant: 
                         <select data-ng-model="selectedTenant" data-ng-change="changeTenant()" data-ng-options="tenant.type + ' - ' + tenant.name for tenant in tenantContainer" tabindex="0">
                            
                         </select>
                     </li>
                    <li><a href="saml/logout">Logout</a></li>
                </ul>
            </div>
            <div class="banner" data-ng-controller="HomeController">                           
                    <span class="logo"><a href="#" data-ng-click="go('/')") tabindex="0"><img data-ng-src="resources/testreg/images/logo_sbac.png" class="thumbnail" alt="Logo" name="SBAC_logo"></a></span>
                           
                    <div class="title"><h1>Administration and Registration Tools </h1></div>
                    <div class="clear"></div>
                </div>
            </div>
        </div>
        <div id="mainContent" data-ng-controller="HomeController" class="content" role="main" tabindex="-1">
                <div data-ui-view="testregview"></div>
        </div>
       <jsp:include page="${includePath}/js-includes.jsp"></jsp:include>
       <jsp:include page="${includePath}/testreg-js-includes.jsp"></jsp:include>
       <jsp:include page="${includePath}/testadmin-js-includes.jsp"></jsp:include>
      
</body>
    
</html>
