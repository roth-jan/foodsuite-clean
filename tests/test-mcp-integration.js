// Playwright Test für MCP Integration
import { test, expect } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import fs from 'fs';

test.describe('MCP Server Integration Tests', () => {
  
  test('AWS MCP Server sollte sich initialisieren', async () => {
    const mcpPath = 'C:\\Users\\JanHendrikRoth\\Desktop\\Claude Ergebnisse\\Claude Ergebnisse\\Foodsuite\\aws_mcp_server.py';
    
    // Test dass die Datei existiert
    expect(fs.existsSync(mcpPath)).toBe(true);
    
    // Test MCP Initialisierung
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test", version: "1.0" }
      }
    };
    
    const result = execSync(`echo '${JSON.stringify(initRequest)}' | python "${mcpPath}"`, 
      { encoding: 'utf8' });
    
    const response = JSON.parse(result.trim());
    
    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(1);
    expect(response.result.protocolVersion).toBe("2024-11-05");
    expect(response.result.serverInfo.name).toBe("aws-mcp-server");
    expect(response.result.aws_info.account).toBe("135704376586");
  });

  test('AWS Account Info sollte abrufbar sein', async () => {
    const mcpPath = 'C:\\Users\\JanHendrikRoth\\Desktop\\Claude Ergebnisse\\Claude Ergebnisse\\Foodsuite\\aws_mcp_server.py';
    
    const accountRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "get_aws_account",
        arguments: {}
      }
    };
    
    const result = execSync(`echo '${JSON.stringify(accountRequest)}' | python "${mcpPath}"`, 
      { encoding: 'utf8' });
    
    const response = JSON.parse(result.trim());
    
    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(2);
    expect(response.result.content).toBeDefined();
    expect(response.result.content[0].type).toBe("text");
    expect(response.result.content[0].text).toContain("Account ID: 135704376586");
    expect(response.result.content[0].text).toContain("Region: eu-central-1");
  });

  test('EC2 Instanzen sollten auflistbar sein', async () => {
    const mcpPath = 'C:\\Users\\JanHendrikRoth\\Desktop\\Claude Ergebnisse\\Claude Ergebnisse\\Foodsuite\\aws_mcp_server.py';
    
    const instancesRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "list_instances",
        arguments: {}
      }
    };
    
    const result = execSync(`echo '${JSON.stringify(instancesRequest)}' | python "${mcpPath}"`, 
      { encoding: 'utf8' });
    
    const response = JSON.parse(result.trim());
    
    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(3);
    expect(response.result.content).toBeDefined();
    expect(response.result.content[0].type).toBe("text");
    expect(response.result.content[0].text).toContain("Found");
    expect(response.result.content[0].text).toContain("EC2 instances");
    
    // Parse the instances JSON from the text
    const instancesText = response.result.content[0].text;
    const instancesJson = instancesText.substring(instancesText.indexOf('[\n'));
    const instances = JSON.parse(instancesJson);
    
    expect(instances.length).toBeGreaterThan(0);
    expect(instances[0]).toHaveProperty('InstanceId');
    expect(instances[0]).toHaveProperty('State');
    expect(instances[0]).toHaveProperty('InstanceType');
  });

  test('FoodSuite Server sollte mit AWS Integration laufen', async ({ page }) => {
    // Prüfe dass der FoodSuite Server läuft
    await page.goto('http://localhost:3000');
    
    await expect(page.locator('h1').first()).toContainText('Dashboard');
    
    // Prüfe Health Endpoint
    const response = await page.goto('http://localhost:3000/api/health');
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData.status).toBe('healthy');
    expect(healthData.service).toBe('foodsuite-api');
  });

  test('MCP Konfiguration sollte korrekt sein', async () => {
    const configPath = 'C:\\Users\\JanHendrikRoth\\AppData\\Roaming\\Claude\\claude_desktop_config.json';
    
    // Prüfe dass Config-Datei existiert
    expect(fs.existsSync(configPath)).toBe(true);
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Prüfe MCP Server Konfiguration
    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers['aws-mcp']).toBeDefined();
    expect(config.mcpServers['aws-mcp'].command).toBe('python');
    expect(config.mcpServers['aws-mcp'].args[0]).toContain('aws_mcp_server.py');
    expect(config.mcpServers['aws-mcp'].env.AWS_REGION).toBe('eu-central-1');
  });
});