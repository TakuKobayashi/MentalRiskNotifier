import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

const chromium = require('chrome-aws-lambda');
const puppeteer = chromium.puppeteer;

export const screenshot: APIGatewayProxyHandler = async (event, _context) => {
  let result: Partial<APIGatewayProxyHandler> = {
    statusCode: 200,
  }
  let browser = null;
  try {
    const viewport = {width: 1024, height: 800};
    const query = event.queryStringParameters
    await chromium.font('https://raw.githack.com/googlei18n/noto-cjk/master/NotoSansJP-Black.otf');
    const chromiumExecutablePath = await chromium.executablePath
    browser = await puppeteer.launch({
      defaultViewport: viewport,
      headless: true,
      executablePath: chromiumExecutablePath,
      args: chromium.args,
    });

    const page = await browser.newPage();
    await page.goto(query.url, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
    });

    const image = await page.screenshot({
      clip: { x: 0, y: 0, ...viewport },
      encoding: 'base64'
    });

    result = {
      statusCode: 200,
      body: image,
      headers: {
        'Content-Type': 'image/png',
      },
      isBase64Encoded: true
    };
  } catch (error) {
    console.error(error);
    result = {
      statusCode: 500,
      message: error,
    };
  }
  finally{
    if(browser){
      await browser.close();
    }
  }

  return result;
}