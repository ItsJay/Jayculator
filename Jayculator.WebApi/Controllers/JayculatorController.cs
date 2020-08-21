using Jayculator.Webapi.Data;
using Jayculator.Webapi.Model;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;

namespace Jayculator.Webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("_trustJayculatorAppCorsPolicy")]
    public class JayculatorController : ControllerBase
    {
        private readonly IConfiguration configuration;
        private readonly AuditDataLayer auditDataLayer;
        public JayculatorController(IConfiguration configuration)
        {
            this.configuration = configuration;
            auditDataLayer = new AuditDataLayer(this.configuration);
        }

        [HttpGet]
        public string Get()
        {
            return "Jayculator api is up and runnig!";
        }

        [HttpPost]
        public IActionResult Calculate([FromBody] Operation operation)
        {
            var remoteIp = HttpContext.Connection.RemoteIpAddress.ToString();
            
            Task.Run(() => fireAndForgetAuditLog(remoteIp));

            //var calculator = new DataTable();
            OperationResult actionResult;
            try
            {
                //var result = Convert.ToDouble(calculator.Compute(operation.ToString(), null)result);
                var result = Compute(operation);
                actionResult = new OperationResult(operation) { Result = Math.Round(result, 12) };
                return Ok(actionResult);
            }
            catch (NotImplementedException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (OverflowException)
            {
                return BadRequest("Result is too large to handle with this tool");
                //throw new Exception(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private double Compute(Operation operation)
        {
            double op1 = Convert.ToDouble(operation.operand1);
            double op2 = Convert.ToDouble(operation.operand2);

            switch (operation.@operator)
            {
                case '+':
                    return op1 + op2;
                case '-':
                    return op1 - op2;
                case 'x':
                    return op1 * op2;
                case '/':
                    return op1 / op2;
                default:
                    throw new NotImplementedException("Operator not supported!");
            }
        }

        private void fireAndForgetAuditLog(string remoteIp)
        {
            auditDataLayer.Log(new LogEntry(remoteIp));
        }
    }
}
