const renderProblemControls = () => {
  const problemConfigs = {
    cavity: {
      icon: <ShieldAlert className="h-4 w-4 text-red-500" />,
      label: "Cavities",
      description: "Show dental cavities"
    },
    gingivitis: {
      icon: <ShieldAlert className="h-4 w-4 text-green-500" />,
      label: "Gingivitis",
      description: "Show gum inflammation"
    },
    fracture: {
      icon: <ShieldAlert className="h-4 w-4 text-yellow-500" />,
      label: "Fractures",
      description: "Show tooth fractures"
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold mb-3 text-gray-700">DENTAL PROBLEMS</h4>
      <div className="space-y-3">
        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Show All Problems</p>
              <p className="text-xs text-gray-500">Toggle all dental problems visibility</p>
            </div>
          </div>
          <Switch
            checked={settings.showProblems}
            onCheckedChange={(checked) => {
              onSettingChange('showProblems', checked);
              // Update all individual problems
              Object.keys(settings.problems).forEach(key => {
                onSettingChange(key, checked, 'problems');
              });
            }}
          />
        </div>

        {/* Individual Problems */}
        {Object.entries(settings.problems).map(([key, value]) => {
          const config = problemConfigs[key] || {
            icon: <ShieldAlert className="h-4 w-4 text-gray-500" />,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            description: `Show ${key} markers`
          };

          return (
            <div key={key} className="flex items-center justify-between pl-6">
              <div className="flex items-center gap-3">
                {config.icon}
                <div>
                  <p className={`text-sm font-medium ${!settings.showProblems ? 'opacity-50' : ''}`}>
                    {config.label}
                  </p>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              </div>
              <Switch
                checked={settings.showProblems && value}
                onCheckedChange={(checked) => onSettingChange(key, checked, 'problems')}
                disabled={!settings.showProblems}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};