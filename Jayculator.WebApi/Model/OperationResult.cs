namespace Jayculator.Webapi.Model
{
    public class OperationResult
    {
        public OperationResult(Operation operation)
        {
            this.Operation = operation;
        }

        public Operation Operation { get; private set; }

        public double Result { get; set; }

        public override string ToString()
        {
            return Operation.ToString() + $"={Result}";
        }
    }
}
