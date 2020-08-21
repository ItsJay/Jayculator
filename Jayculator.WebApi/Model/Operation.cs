namespace Jayculator.Webapi.Model
{
    public class Operation
    {
        public string operand1 { get; set; }

        public string operand2 { get; set; }

        public char @operator { get; set; }

        public override string ToString()
        {
            return $"{operand1}{@operator}{operand2}";
        }
    }
}
