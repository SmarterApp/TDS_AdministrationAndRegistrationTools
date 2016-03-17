module.exports = function(grunt){
	var _ = grunt.util._;
	
	grunt.registerTask("jspinclude"," generates a jsp page with js includes", function(target){
		var context, source, targetConfig, template;
		target = target || "dist";
		grunt.log.writeln("Creating jsp include for target " + target);
		this.requiresConfig("jspinclude.template");
		this.requiresConfig("jspinclude." + target);
		template = grunt.config.get("jspinclude.template");
		targetConfig = grunt.config.get("jspinclude." + target);
		source = grunt.file.read(template);
		
		context = _(grunt.config.get()).extend(targetConfig.context);
		
		context.javascriptIncludes = grunt.file.expand(context.js);
		for(indx in context.javascriptIncludes){
			context.javascriptIncludes[indx] = context.javascriptIncludes[indx].replace('../main/webapp/','');
		}
		grunt.file.write(targetConfig.dest, _(source).template(context));
		grunt.log.writeln("Done creating jspage");
	});
	
	grunt.registerTask("cssinclude"," generates a jsp page with css includes", function(target){
		var context, source, targetConfig, template;
		target = target || "dist";
		
		grunt.log.writeln("Creating css include for target " + target);
		this.requiresConfig("cssinclude.template");
		this.requiresConfig("cssinclude." + target);
		template = grunt.config.get("cssinclude.template");
		targetConfig = grunt.config.get("cssinclude." + target);
		source = grunt.file.read(template);
		context = _(grunt.config.get()).extend(targetConfig.context);
		
		context.cssIncludes = grunt.file.expand(context.css); 
		for(indx in context.cssIncludes){
			context.cssIncludes[indx] = context.cssIncludes[indx].replace('../main/webapp/','');
		}
		
		grunt.file.write(targetConfig.dest, _(source).template(context));
		grunt.log.writeln("Done creating jsp page with css includes");
	});
	
};